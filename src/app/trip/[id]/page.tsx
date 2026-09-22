import { createClient } from "@/lib/supabase/server";
import { TripShell } from "./trip-view";

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: group }] = await Promise.all([
    supabase.auth.getSession().then(({ data }) => ({ data: { user: data.session?.user ?? null } })),
    supabase
      .from("groups")
      .select("id, name, base_currency, spend_currency, fixed_fx_rate, simplify_debts")
      .eq("id", id)
      .single(),
  ]);

  if (!user) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to view this group</p>
        <a href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </a>
      </div>
    );
  }

  // Claim any email invite waiting for this user
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
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <p className="text-xs text-[var(--muted)] mt-1">It may have been deleted or you don&apos;t have access</p>
        <a href="/" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </a>
      </div>
    );
  }

  return (
    <TripShell
      tripId={group.id}
      tripName={group.name}
      baseCurrency={group.base_currency}
      spendCurrency={group.spend_currency}
      fxRate={Number(group.fixed_fx_rate) || 1}
      simplify={group.simplify_debts}
    />
  );
}
