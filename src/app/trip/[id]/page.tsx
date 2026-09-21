import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/mock-data";
import { TripShell } from "./trip-view";
import { BalancesPane, ExpensesPane, SettlePane } from "./panes";

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Shell paints after this single wave — tab data streams in behind it.
  const [{ data: { user } }, { data: group }, { data: memberRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("groups")
      .select("id, name, base_currency, simplify_debts")
      .eq("id", id)
      .single(),
    supabase.from("group_members").select("id, name, avatar, upi_id").eq("group_id", id),
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

  // Claim any email invite waiting for this user (tiny indexed write)
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

  const members: Member[] = (memberRows || []).map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    upiId: m.upi_id || undefined,
  }));

  return (
    <TripShell
      tripId={group.id}
      tripName={group.name}
      expensesPane={<ExpensesPane groupId={group.id} baseCurrency={group.base_currency} members={members} />}
      balancesPane={<BalancesPane groupId={group.id} baseCurrency={group.base_currency} members={members} />}
      settlePane={<SettlePane groupId={group.id} baseCurrency={group.base_currency} members={members} simplify={group.simplify_debts} />}
    />
  );
}
