import { applyRecorded, computeBalances, simplifyDebts } from "./settlements";

export interface PositionInput {
  members: { id: string; userId: string | null; name: string }[];
  expenses: { paidBy: string; baseAmount: number }[];
  splits: { memberId: string; amountOwed: number }[];
  recorded: { from: string; to: string; amount: number; currency: string }[];
  simplify: boolean;
  currency: string;
  fxRate: number;
  currentUserId: string;
}

export interface Counterparty {
  name: string;
  amount: number;
}

export interface Position {
  memberId: string | null;
  net: number;
  currency: string;
  /** Settlements where I pay (I owe them) */
  iOwe: Counterparty[];
  /** Settlements where they pay me (they owe me) */
  owesMe: Counterparty[];
}

/** My net position in a group, with simplified counterparty lines. */
export function computePosition(input: PositionInput): Position {
  const { members, expenses, splits, recorded, simplify, currency, fxRate, currentUserId } = input;
  const me = members.find((m) => m.userId === currentUserId) || null;
  if (!me) return { memberId: null, net: 0, currency, iOwe: [], owesMe: [] };

  const round2 = (v: number) => Math.round(v * 100) / 100;
  const balances = computeBalances(
    members.map((m) => m.id),
    expenses,
    splits,
    currency
  );
  const settled = applyRecorded(
    balances,
    recorded.map((r) => ({
      from: r.from,
      to: r.to,
      amount: r.currency === currency ? r.amount : round2(r.amount * (fxRate || 1)),
    }))
  );
  const mine = settled.find((b) => b.memberId === me.id);
  const net = mine ? mine.amount : 0;

  const plan = simplify ? simplifyDebts(settled, currency) : [];
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name || "Someone";

  // Without simplification, fall back to raw pairwise: everyone I don't
  // fully cover shows up via net sign only — counterparty lists stay empty
  // and the UI renders the bare total.
  const iOwe: Counterparty[] = [];
  const owesMe: Counterparty[] = [];
  for (const s of plan) {
    if (s.from === me.id) iOwe.push({ name: nameOf(s.to), amount: s.amount });
    else if (s.to === me.id) owesMe.push({ name: nameOf(s.from), amount: s.amount });
  }
  return { memberId: me.id, net: Math.round(net * 100) / 100, currency, iOwe, owesMe };
}
