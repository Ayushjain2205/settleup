import type { GroupListItem } from "./queries";

interface GroupRow {
  id: string;
  name: string;
  base_currency: string;
  group_members: { id: string; avatar: string }[] | null;
  expenses: { base_amount: string | number; expense_date: string | null }[] | null;
}

export function mapGroupRows(rows: GroupRow[]): GroupListItem[] {
  return (rows || []).map((g) => {
    const expenses = g.expenses || [];
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.base_amount), 0);
    const lastDate =
      expenses
        .map((e) => e.expense_date)
        .filter(Boolean)
        .sort()
        .reverse()[0] || null;
    return {
      id: g.id,
      name: g.name,
      baseCurrency: g.base_currency,
      members: g.group_members || [],
      totalSpent,
      lastDate,
    };
  });
}
