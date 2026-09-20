import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import type { Balance, Expense, Member, Settlement } from "@/lib/mock-data";
import { TripView } from "./trip-view";

function broadOf(categoryId: string): Expense["category"] {
  return CATEGORIES.find((c) => c.id === categoryId)?.broad || "other";
}

function computeBalances(
  members: Member[],
  expenses: { paidBy: string; baseAmount: number }[],
  splits: { expenseId: string; memberId: string; amountOwed: number }[],
  expenseById: Map<string, { paidBy: string; baseAmount: number }>,
  currency: string
): Balance[] {
  const paid = new Map<string, number>();
  const owed = new Map<string, number>();
  for (const m of members) {
    paid.set(m.id, 0);
    owed.set(m.id, 0);
  }
  for (const e of expenses) {
    paid.set(e.paidBy, (paid.get(e.paidBy) || 0) + e.baseAmount);
  }
  for (const s of splits) {
    if (!expenseById.has(s.expenseId)) continue;
    owed.set(s.memberId, (owed.get(s.memberId) || 0) + s.amountOwed);
  }
  return members.map((m) => ({
    memberId: m.id,
    amount: Math.round(((paid.get(m.id) || 0) - (owed.get(m.id) || 0)) * 100) / 100,
    currency,
  }));
}

function simplifyDebts(balances: Balance[], currency: string): Settlement[] {
  const creditors = balances
    .filter((b) => b.amount > 0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.amount < -0.009)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.amount - b.amount);

  const result: Settlement[] = [];
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

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to view this group</p>
        <a href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, base_currency, spend_currency, fx_mode, fixed_fx_rate, simplify_debts")
    .eq("id", id)
    .single();

  if (!group) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <p className="text-xs text-[var(--muted)] mt-1">It may have been deleted or you don&apos;t have access</p>
        <a href="/" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </a>
      </div>
    );
  }

  const [{ data: memberRows }, { data: expenseRows }, { data: splitRows }] = await Promise.all([
    supabase.from("group_members").select("id, name, avatar, upi_id").eq("group_id", id),
    supabase
      .from("expenses")
      .select("id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date")
      .eq("group_id", id)
      .order("expense_date", { ascending: false }),
    supabase
      .from("expense_splits")
      .select("expense_id, member_id, amount_owed")
      .in("expense_id", (await supabase.from("expenses").select("id").eq("group_id", id)).data?.map((e) => e.id) || ["00000000-0000-0000-0000-000000000000"]),
  ]);

  const members: Member[] = (memberRows || []).map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    upiId: m.upi_id || undefined,
  }));

  const expenses: Expense[] = (expenseRows || []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    currency: e.currency,
    baseAmount: Number(e.base_amount),
    baseCurrency: group.base_currency,
    paidBy: e.paid_by,
    splitAmong: (splitRows || []).filter((s) => s.expense_id === e.id).map((s) => s.member_id),
    splitType: e.split_mode === "percent" ? "exact" : (e.split_mode as Expense["splitType"]),
    date: e.expense_date,
    category: broadOf(e.category_id),
  }));

  const splits = (splitRows || []).map((s) => ({
    expenseId: s.expense_id,
    memberId: s.member_id,
    amountOwed: Number(s.amount_owed),
  }));
  const expenseById = new Map(
    expenses.map((e) => [e.id, { paidBy: e.paidBy, baseAmount: e.baseAmount }] as const)
  );

  const balances = computeBalances(
    members,
    expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount })),
    splits,
    expenseById,
    group.base_currency
  );
  const settlements = group.simplify_debts ? simplifyDebts(balances, group.base_currency) : [];

  return (
    <TripView
      tripId={group.id}
      tripName={group.name}
      members={members}
      expenses={expenses}
      balances={balances}
      settlements={settlements}
    />
  );
}
