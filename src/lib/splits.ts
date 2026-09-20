export type SplitMode = "equal" | "exact" | "percent" | "itemized";

export interface ItemInput {
  name: string;
  amount: string;
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
  /** Convert an entered-currency value to base currency */
  toBase: (v: number) => number;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

/** Per-member owed amounts in base currency. Itemized collapses items into member totals. */
export function computeSplitOwes({
  mode,
  baseAmount,
  selected,
  exactAmounts,
  percentages,
  items,
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
  return [...totals.entries()].map(([memberId, amountOwed]) => ({
    memberId,
    amountOwed: round2(amountOwed),
  }));
}
