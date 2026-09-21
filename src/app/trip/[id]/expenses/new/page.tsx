import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";

export default async function AddExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: group }, { data: memberRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("groups")
      .select("id, name, base_currency, spend_currency, fixed_fx_rate")
      .eq("id", id)
      .single(),
    supabase
      .from("group_members")
      .select("id, name, avatar")
      .eq("group_id", id),
  ]);

  if (!user) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to add an expense</p>
        <a href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <a href="/" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </a>
      </div>
    );
  }

  return (
    <ExpenseForm
      group={{
        id: group.id,
        name: group.name,
        baseCurrency: group.base_currency,
        spendCurrency: group.spend_currency,
        fxRate: Number(group.fixed_fx_rate),
      }}
      members={(memberRows || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }))}
    />
  );
}
