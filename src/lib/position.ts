import { computeBalances, simplifyDebts } from "./settlements";

export interface PositionInput {
  members: { id: string; userId: string | null; name: string }[];
  expenses: { paidBy: string; baseAmount: number }[];
  splits: { memberId: string; amountOwed: number }[];
  simplify: boolean;
  currency: string;
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
  const { members, expenses, splits, simplify, currency, currentUserId } = input;
  const me = members.find((m) => m.userId === currentUserId) || null;
  if (!me) return { memberId: null, net: 0, currency, iOwe: [], owesMe: [] };

  const balances = computeBalances(
    members.map((m) => m.id),
    expenses,
    splits,
    currency
  );
  const mine = balances.find((b) => b.memberId === me.id);
  const net = mine ? mine.amount : 0;

  const plan = simplify ? simplifyDebts(balances, currency) : [];
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
