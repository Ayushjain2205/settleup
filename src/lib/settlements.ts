import type { Balance } from "./mock-data";

export interface BalanceInput {
  memberId: string;
  paidBase: number;
  owedBase: number;
}

export function computeBalances(
  memberIds: string[],
  paid: { paidBy: string; baseAmount: number }[],
  splits: { memberId: string; amountOwed: number }[],
  currency: string
): Balance[] {
  const paidBy = new Map<string, number>();
  const owedBy = new Map<string, number>();
  for (const id of memberIds) {
    paidBy.set(id, 0);
    owedBy.set(id, 0);
  }
  for (const e of paid) {
    paidBy.set(e.paidBy, (paidBy.get(e.paidBy) || 0) + e.baseAmount);
  }
  for (const s of splits) {
    if (!owedBy.has(s.memberId)) continue;
    owedBy.set(s.memberId, (owedBy.get(s.memberId) || 0) + s.amountOwed);
  }
  return memberIds.map((id) => ({
    memberId: id,
    amount: Math.round(((paidBy.get(id) || 0) - (owedBy.get(id) || 0)) * 100) / 100,
    currency,
  }));
}

/** Fold confirmed payments into balances: payer owes less,
 *  receiver is owed less. Amounts must share the balances' currency. */
export function applyRecorded(
  balances: Balance[],
  recorded: { from: string; to: string; amount: number }[]
): Balance[] {
  return balances.map((b) => {
    let amount = b.amount;
    for (const r of recorded) {
      if (r.from === b.memberId) amount = Math.round((amount + r.amount) * 100) / 100;
      if (r.to === b.memberId) amount = Math.round((amount - r.amount) * 100) / 100;
    }
    return { ...b, amount };
  });
}

/** Unsimplified view: net balance per pair across the group (no
 *  cross-pair netting). Opposite directions collapse to the delta —
 *  a pair never shows both ways. Self-pairs are skipped. */
export function pairwiseDebts(
  items: { paidBy: string; splits: { memberId: string; amountOwed: number }[] }[],
  currency: string
): { from: string; to: string; amount: number; currency: string }[] {
  const directed = new Map<string, number>();
  for (const item of items) {
    for (const s of item.splits) {
      if (s.memberId === item.paidBy || s.amountOwed < 0.01) continue;
      const key = `${s.memberId}→${item.paidBy}`;
      directed.set(key, (directed.get(key) || 0) + s.amountOwed);
    }
  }
  const seen = new Set<string>();
  const result: { from: string; to: string; amount: number; currency: string }[] = [];
  for (const [key, amount] of directed) {
    if (seen.has(key)) continue;
    const [a, b] = key.split("→");
    const reverse = `${b}→${a}`;
    seen.add(key);
    seen.add(reverse);
    const net = amount - (directed.get(reverse) || 0);
    if (net > 0.009) result.push({ from: a, to: b, amount: Math.round(net * 100) / 100, currency });
    else if (net < -0.009) result.push({ from: b, to: a, amount: Math.round(-net * 100) / 100, currency });
  }
  return result;
}

/** Greedy min-cash-flow: fewest transfers to settle all debts. */export function simplifyDebts(balances: Balance[], currency: string): { from: string; to: string; amount: number; currency: string }[] {
  const creditors = balances
    .filter((b) => b.amount > 0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.amount < -0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.amount - b.amount);

  const result: { from: string; to: string; amount: number; currency: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < creditors.length && j < debtors.length) {
    const c = creditors[i];
    const d = debtors[j];
    const payment = Math.min(c.amount, -d.amount);
    if (payment < 0.01) break;
    result.push({
      from: d.memberId,
      to: c.memberId,
      amount: Math.round(payment * 100) / 100,
      currency,
    });
    c.amount -= payment;
    d.amount += payment;
    if (c.amount < 0.01) i++;
    if (-d.amount < 0.01) j++;
  }
  return result;
}
