export type SplitMode = "equal" | "exact" | "percent" | "itemized";

export interface ItemInput {
  name: string;
  amount: string;
  splitAmong: string[];
}

export interface AdjustmentInput {
  name: string;
  amount: string;
  /** Auto: proportional to each member's share of the items subtotal.
   *  Custom: split equally among splitAmong. */
  auto: boolean;
  splitAmong: string[];
}

export interface SplitOwed {
  memberId: string;
  amountOwed: number;
}

interface ComputeSplitsArgs {
  mode: SplitMode;
  /** Total in base currency */
  baseAmount: number;
  selected: string[];
  exactAmounts: Record<string, string>;
  percentages: Record<string, string>;
  items: ItemInput[];
  adjustments: AdjustmentInput[];
  /** Convert an entered-currency value to base currency */
  toBase: (v: number) => number;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

/** Largest-remainder penny fix: nudge rounded cents so the parts sum
 *  exactly to the target. `raws` are the unrounded values (same order as
 *  `out`) used to rank who gets the leftover pennies fairly. Without this,
 *  e.g. 1300 split 3 ways rounds to 433.33 x3 = 1299.99 and leaves a phantom
 *  0.01 credit that never settles. */
export function reconcileCents(
  out: SplitOwed[],
  raws: number[],
  targetCents: number
): SplitOwed[] {
  if (out.length === 0) return out;
  const sumCents = out.reduce((s, r) => s + Math.round(r.amountOwed * 100), 0);
  let diff = Math.round(targetCents) - sumCents;
  if (diff === 0) return out;
  // Only fix rounding dust (at most a penny per part). Larger gaps are
  // genuine under/over splits — leave them alone.
  if (Math.abs(diff) > out.length) return out;
  const frac = raws.map((r) => {
    const cents = r * 100;
    return cents - Math.floor(cents + 1e-9);
  });
  const order = out.map((_, i) => i).sort((a, b) =>
    diff > 0 ? frac[b] - frac[a] || a - b : frac[a] - frac[b] || a - b
  );
  const fixed = out.map((r) => ({ ...r }));
  let k = 0;
  while (diff !== 0) {
    const i = order[k % order.length];
    fixed[i] = { ...fixed[i], amountOwed: round2(fixed[i].amountOwed + (diff > 0 ? 0.01 : -0.01)) };
    diff += diff > 0 ? -1 : 1;
    k++;
    // Safety: never loop forever on pathological input.
    if (k > out.length * 10) break;
  }
  return fixed;
}

/** Per-member owed amounts in base currency. Itemized collapses items
 *  into member totals; auto adjustments ride proportionally on top. */
export function computeSplitOwes({
  mode,
  baseAmount,
  selected,
  exactAmounts,
  percentages,
  items,
  adjustments,
  toBase,
}: ComputeSplitsArgs): SplitOwed[] {
  if (mode === "equal") {
    if (selected.length === 0) return [];
    const targetCents = Math.round(round2(baseAmount) * 100);
    const floorCents = Math.floor(targetCents / selected.length);
    const remainder = targetCents - floorCents * selected.length;
    return selected.map((id, i) => ({
      memberId: id,
      amountOwed: (floorCents + (i < remainder ? 1 : 0)) / 100,
    }));
  }
  if (mode === "exact") {
    const entries = Object.entries(exactAmounts).filter(([, v]) => (parseFloat(v) || 0) > 0);
    const raws = entries.map(([, v]) => toBase(parseFloat(v)));
    const out = entries.map(([id], i) => ({ memberId: id, amountOwed: round2(raws[i]) }));
    return reconcileCents(out, raws, Math.round(round2(baseAmount) * 100));
  }
  if (mode === "percent") {
    const entries = Object.entries(percentages).filter(([, v]) => (parseFloat(v) || 0) > 0);
    const raws = entries.map(([, v]) => baseAmount * (parseFloat(v) / 100));
    const out = entries.map(([id], i) => ({ memberId: id, amountOwed: round2(raws[i]) }));
    return reconcileCents(out, raws, Math.round(round2(baseAmount) * 100));
  }
  const totals = new Map<string, number>();
  for (const item of items) {
    const itemBase = toBase(parseFloat(item.amount) || 0);
    if (item.splitAmong.length === 0) continue;
    const share = itemBase / item.splitAmong.length;
    for (const id of item.splitAmong) {
      totals.set(id, (totals.get(id) || 0) + share);
    }
  }
  // Snapshot item-only totals: proportional adjustments allocate against
  // these so multiple adjustments never compound on each other.
  const itemTotals = new Map(totals);
  const itemsSubtotal = [...itemTotals.values()].reduce((a, b) => a + b, 0);
  const addShare = (id: string, v: number) => totals.set(id, (totals.get(id) || 0) + v);

  for (const adj of adjustments) {
    const adjBase = toBase(parseFloat(adj.amount) || 0);
    if (adjBase === 0 || Number.isNaN(adjBase)) continue;
    if (!adj.auto) {
      if (adj.splitAmong.length === 0) continue;
      const share = adjBase / adj.splitAmong.length;
      for (const id of adj.splitAmong) addShare(id, share);
      continue;
    }
    if (itemsSubtotal > 0) {
      for (const [id, sub] of itemTotals) {
        addShare(id, (adjBase * sub) / itemsSubtotal);
      }
      continue;
    }
    // No item subtotal (empty items): equal among everyone involved.
    const everyone = [...new Set([...totals.keys(), ...adj.splitAmong])];
    if (everyone.length === 0) continue;
    const share = adjBase / everyone.length;
    for (const id of everyone) addShare(id, share);
  }
  const rawsByMember = [...totals.entries()].map(([, v]) => v);
  const out = [...totals.entries()].map(([memberId, amountOwed], i) => ({
    memberId,
    amountOwed: round2(rawsByMember[i]),
  }));
  return reconcileCents(out, rawsByMember, Math.round(round2(baseAmount) * 100));
}
