import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import { computeBalances, simplifyDebts } from "@/lib/settlements";
import type { Expense, Member } from "@/lib/mock-data";
import { TripView } from "./trip-view";

function broadOf(categoryId: string): Expense["category"] {
  return CATEGORIES.find((c) => c.id === categoryId)?.broad || "other";
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: group }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("groups")
      .select("id, name, base_currency, spend_currency, fx_mode, fixed_fx_rate, simplify_debts")
      .eq("id", id)
      .single(),
  ]);

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

  // Claim any email invite waiting for this user, then proceed as a member
  if (group && user.email) {
    await supabase
      .from("group_members")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("group_id", id)
      .eq("email", user.email);
  }

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

  // Claim invite first — awaited alongside the reads so they see membership
  if (user.email) {
    await supabase
      .from("group_members")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("group_id", id)
      .eq("email", user.email);
  }

  const [{ data: memberRows }, { data: expenseRows }, { data: splitRows }, { data: recordedRows }] = await Promise.all([
    supabase.from("group_members").select("id, name, avatar, upi_id").eq("group_id", id),
    supabase
      .from("expenses")
      .select("id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date")
      .eq("group_id", id)
      .order("expense_date", { ascending: false }),
    supabase
      .from("expense_splits")
      .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
      .eq("expenses.group_id", id),
    supabase
      .from("settlements")
      .select("from_member, to_member, amount, currency, created_at")
      .eq("group_id", id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false }),
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
    memberId: s.member_id,
    amountOwed: Number(s.amount_owed),
  }));

  const balances = computeBalances(
    members.map((m) => m.id),
    expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount })),
    splits,
    group.base_currency
  );

  // Fold confirmed payments in: payer owes less, receiver is owed less
  const recorded = (recordedRows || []).map((r) => ({
    from: r.from_member,
    to: r.to_member,
    amount: Number(r.amount),
    currency: r.currency,
    date: r.created_at,
  }));
  for (const r of recorded) {
    const from = balances.find((b) => b.memberId === r.from);
    const to = balances.find((b) => b.memberId === r.to);
    if (from) from.amount = Math.round((from.amount + r.amount) * 100) / 100;
    if (to) to.amount = Math.round((to.amount - r.amount) * 100) / 100;
  }

  const settlements = group.simplify_debts ? simplifyDebts(balances, group.base_currency) : [];

  return (
    <TripView
      tripId={group.id}
      tripName={group.name}
      members={members}
      expenses={expenses}
      balances={balances}
      settlements={settlements}
      recorded={recorded}
    />
  );
}
