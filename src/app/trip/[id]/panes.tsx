import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import { computeBalances, simplifyDebts } from "@/lib/settlements";
import type { Expense, Member } from "@/lib/mock-data";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";

function broadOf(categoryId: string): Expense["category"] {
  return CATEGORIES.find((c) => c.id === categoryId)?.broad || "other";
}

function ListSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="list-item bg-white border-b border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--border-color)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-[var(--border-color)]" />
            <div className="h-2.5 w-1/3 rounded bg-[var(--border-color)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function getMembers(supabase: Awaited<ReturnType<typeof createClient>>, groupId: string): Promise<Member[]> {
  const { data } = await supabase.from("group_members").select("id, name, avatar, upi_id").eq("group_id", groupId);
  return (data || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, upiId: m.upi_id || undefined }));
}

async function getExpenses(supabase: Awaited<ReturnType<typeof createClient>>, groupId: string, baseCurrency: string): Promise<Expense[]> {
  const [{ data: expenseRows }, { data: splitRows }] = await Promise.all([
    supabase
      .from("expenses")
      .select("id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date")
      .eq("group_id", groupId)
      .order("expense_date", { ascending: false }),
    supabase
      .from("expense_splits")
      .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
      .eq("expenses.group_id", groupId),
  ]);
  return (expenseRows || []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    currency: e.currency,
    baseAmount: Number(e.base_amount),
    baseCurrency,
    paidBy: e.paid_by,
    splitAmong: (splitRows || []).filter((s) => s.expense_id === e.id).map((s) => s.member_id),
    splitType: e.split_mode === "percent" ? "exact" : (e.split_mode as Expense["splitType"]),
    date: e.expense_date,
    category: broadOf(e.category_id),
  }));
}

export async function ExpensesPane({ groupId, baseCurrency }: { groupId: string; baseCurrency: string }) {
  const supabase = await createClient();
  const [members, expenses] = await Promise.all([
    getMembers(supabase, groupId),
    getExpenses(supabase, groupId, baseCurrency),
  ]);
  return <ExpensesList expenses={expenses} members={members} />;
}

export async function BalancesPane({ groupId, baseCurrency }: { groupId: string; baseCurrency: string }) {
  const supabase = await createClient();
  const [members, expenses] = await Promise.all([
    getMembers(supabase, groupId),
    getExpenses(supabase, groupId, baseCurrency),
  ]);
  const { data: splitRows } = await supabase
    .from("expense_splits")
    .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
    .eq("expenses.group_id", groupId);
  const balances = computeBalances(
    members.map((m) => m.id),
    expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount })),
    (splitRows || []).map((s) => ({ memberId: s.member_id, amountOwed: Number(s.amount_owed) })),
    baseCurrency
  );
  return <BalancesPanel balances={balances} members={members} />;
}

export async function SettlePane({ groupId, baseCurrency, simplify }: { groupId: string; baseCurrency: string; simplify: boolean }) {
  const supabase = await createClient();
  const [members, expenses] = await Promise.all([
    getMembers(supabase, groupId),
    getExpenses(supabase, groupId, baseCurrency),
  ]);
  const [{ data: splitRows }, { data: recordedRows }] = await Promise.all([
    supabase
      .from("expense_splits")
      .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
      .eq("expenses.group_id", groupId),
    supabase
      .from("settlements")
      .select("from_member, to_member, amount, currency, created_at")
      .eq("group_id", groupId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false }),
  ]);
  const balances = computeBalances(
    members.map((m) => m.id),
    expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount })),
    (splitRows || []).map((s) => ({ memberId: s.member_id, amountOwed: Number(s.amount_owed) })),
    baseCurrency
  );
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
  const settlements = simplify ? simplifyDebts(balances, baseCurrency) : [];
  return <SettleTab groupId={groupId} settlements={settlements} recorded={recorded} members={members} />;
}

export function PaneFallback() {
  return <ListSkeleton />;
}
