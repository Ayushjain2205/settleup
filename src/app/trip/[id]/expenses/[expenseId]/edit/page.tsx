import { createClient } from "@/lib/supabase/server";
import { ExpenseForm, type ExpenseInitial } from "../../new/expense-form";

const round2 = (v: number) => Math.round(v * 100) / 100;

export default async function EditExpensePage({ params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const { id, expenseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to edit this expense</p>
        <a href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  const [{ data: group }, { data: expense }, { data: memberRows }, { data: splitRows }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, base_currency, spend_currency, fixed_fx_rate")
      .eq("id", id)
      .single(),
    supabase.from("expenses").select("*").eq("id", expenseId).eq("group_id", id).single(),
    supabase.from("group_members").select("id, name, avatar").eq("group_id", id),
    supabase.from("expense_splits").select("member_id, amount_owed").eq("expense_id", expenseId),
  ]);

  if (!group || !expense) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Expense not found</p>
        <a href={`/trip/${id}`} className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to group
        </a>
      </div>
    );
  }

  const members = (memberRows || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));
  const fxRate = Number(group.fixed_fx_rate);
  const useBase = expense.currency === group.base_currency;
  const toEntered = (base: number) => (useBase ? base : base / fxRate);
  const amountNum = Number(expense.amount);
  const baseTotal = Number(expense.base_amount);

  const splits = (splitRows || []).map((s) => ({ memberId: s.member_id, owed: Number(s.amount_owed) }));
  const selectedMembers = splits.map((s) => s.memberId);

  // Itemized rows aren't stored — reopen as exact with per-member amounts,
  // pinned so the books balance on open.
  const exactAmounts: Record<string, string> = {};
  if (expense.split_mode !== "equal") {
    let running = 0;
    splits.forEach((s, i) => {
      const v = round2(toEntered(s.owed));
      if (i < splits.length - 1) {
        exactAmounts[s.memberId] = String(v);
        running += v;
      } else {
        exactAmounts[s.memberId] = String(round2(amountNum - running));
      }
    });
  }

  const percentages: Record<string, string> = {};
  if (baseTotal > 0) {
    let running = 0;
    splits.forEach((s, i) => {
      const v = round2((s.owed / baseTotal) * 100);
      if (i < splits.length - 1) {
        percentages[s.memberId] = String(v);
        running += v;
      } else {
        percentages[s.memberId] = String(round2(100 - running));
      }
    });
  }

  const initial: ExpenseInitial = {
    id: expense.id,
    title: expense.title,
    amount: String(amountNum),
    useBaseCurrency: useBase,
    paidBy: expense.paid_by,
    splitMode: expense.split_mode === "itemized" ? "exact" : (expense.split_mode as ExpenseInitial["splitMode"]),
    selectedMembers,
    exactAmounts,
    percentages,
    categoryId: expense.category_id,
    expenseDate: expense.expense_date,
  };

  return (
    <ExpenseForm
      group={{
        id: group.id,
        name: group.name,
        baseCurrency: group.base_currency,
        spendCurrency: group.spend_currency,
        fxRate,
      }}
      members={members}
      initial={initial}
    />
  );
}
