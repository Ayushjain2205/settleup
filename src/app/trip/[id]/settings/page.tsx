import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to view settings</p>
        <a href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, base_currency, spend_currency, fx_mode, fixed_fx_rate, simplify_debts, created_by")
    .eq("id", id)
    .single();

  if (!group) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <a href="/" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </a>
      </div>
    );
  }

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("id, name, avatar, user_id, email")
    .eq("group_id", id);

  return (
    <SettingsForm
      group={{
        id: group.id,
        baseCurrency: group.base_currency,
        spendCurrency: group.spend_currency,
        simplifyDebts: group.simplify_debts,
        fxMode: group.fx_mode,
        fixedFxRate: Number(group.fixed_fx_rate),
        createdBy: group.created_by,
      }}
      members={(memberRows || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, userId: m.user_id, email: m.email }))}
      currentUserId={user.id}
    />
  );
}
