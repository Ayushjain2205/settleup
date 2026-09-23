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
    const share = baseAmount / selected.length;
    return selected.map((id) => ({ memberId: id, amountOwed: round2(share) }));
  }
  if (mode === "exact") {
    return Object.entries(exactAmounts)
      .filter(([, v]) => (parseFloat(v) || 0) > 0)
      .map(([id, v]) => ({ memberId: id, amountOwed: round2(toBase(parseFloat(v))) }));
  }
  if (mode === "percent") {
    return Object.entries(percentages)
      .filter(([, v]) => (parseFloat(v) || 0) > 0)
      .map(([id, v]) => ({ memberId: id, amountOwed: round2(baseAmount * (parseFloat(v) / 100)) }));
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
  return [...totals.entries()].map(([memberId, amountOwed]) => ({
    memberId,
    amountOwed: round2(amountOwed),
  }));
}
