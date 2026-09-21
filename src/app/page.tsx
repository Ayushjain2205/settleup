import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/landing");

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, base_currency, group_members(id, name, avatar), expenses(base_amount, expense_date)")
    .order("created_at", { ascending: false });

  const trips = (groups || []).map((g) => {
    const expenses = g.expenses || [];
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.base_amount), 0);
    const lastDate = expenses
      .map((e) => e.expense_date)
      .filter(Boolean)
      .sort()
      .reverse()[0];
    return {
      id: g.id,
      name: g.name,
      baseCurrency: g.base_currency,
      members: g.group_members || [],
      totalSpent,
      lastDate,
    };
  });

  const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Groups</h1>
          <Link href="/groups/new" className="p-1">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        {/* Active groups */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Active</span>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trip/${trip.id}`}
              className="block px-4 py-3 bg-white active:bg-[var(--background)] transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Group icon */}
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--foreground)] truncate">{trip.name}</span>
                    <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">{symbol(trip.baseCurrency)}{trip.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1.5">
                      {/* Member avatars */}
                      <div className="flex -space-x-1.5">
                        {trip.members.slice(0, 3).map((m) => (
                          <div key={m.id} className="w-4 h-4 rounded-full bg-[var(--foreground)] border border-white flex items-center justify-center text-[6px] font-bold text-white">
                            {m.avatar}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">
                        {trip.members.length} members
                      </span>
                    </div>
                    {trip.lastDate && (
                      <span className="text-[10px] text-[var(--muted)]">
                        {new Date(trip.lastDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state if no groups */}
        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">No groups yet</p>
            <p className="text-xs text-[var(--muted)] mt-1 mb-4">Create your first group to start tracking</p>
            <Link href="/groups/new" className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
              Create Group
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
