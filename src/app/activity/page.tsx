import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

interface FeedItem {
  key: string;
  at: string;
  subject: string;
  initial: string;
  action: string;
  detail: string | null;
  amount: string | null;
  trip: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/landing");

  const { data: groups } = await supabase.from("groups").select("id, name, base_currency");
  const groupIds = (groups || []).map((g) => g.id);
  const groupById = new Map((groups || []).map((g) => [g.id, g]));

  let feed: FeedItem[] = [];
  if (groupIds.length > 0) {
    const [{ data: members }, { data: expenses }, { data: settlements }] = await Promise.all([
      supabase.from("group_members").select("id, group_id, name, user_id").in("group_id", groupIds),
      supabase
        .from("expenses")
        .select("id, group_id, title, base_amount, paid_by, created_at")
        .in("group_id", groupIds)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("settlements")
        .select("id, group_id, from_member, to_member, amount, currency, created_at")
        .in("group_id", groupIds)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const memberById = new Map((members || []).map((m) => [m.id, m]));
    const nameOf = (memberId: string) => {
      const m = memberById.get(memberId);
      if (!m) return "Someone";
      return m.user_id === user.id ? "You" : m.name;
    };
    const initialOf = (memberId: string) => nameOf(memberId)[0]?.toUpperCase() || "?";

    for (const e of expenses || []) {
      const g = groupById.get(e.group_id);
      if (!g) continue;
      feed.push({
        key: `e-${e.id}`,
        at: e.created_at,
        subject: nameOf(e.paid_by),
        initial: initialOf(e.paid_by),
        action: "added expense",
        detail: e.title,
        amount: `${symbol(g.base_currency)}${Number(e.base_amount).toLocaleString()}`,
        trip: g.name,
      });
    }
    for (const s of settlements || []) {
      const g = groupById.get(s.group_id);
      if (!g) continue;
      feed.push({
        key: `s-${s.id}`,
        at: s.created_at,
        subject: nameOf(s.from_member),
        initial: initialOf(s.from_member),
        action: "paid",
        detail: memberById.get(s.to_member)?.name || "someone",
        amount: `${symbol(s.currency)}${Number(s.amount).toLocaleString()}`,
        trip: g.name,
      });
    }
    feed.sort((a, b) => b.at.localeCompare(a.at));
    feed = feed.slice(0, 30);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Activity</h1>
        </div>
      </header>

      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <p className="text-sm font-medium text-[var(--foreground)]">No activity yet</p>
            <p className="text-xs text-[var(--muted)] mt-1">Expenses and payments will show up here</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {feed.map((item) => (
              <div key={item.key} className="px-4 py-3 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {item.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--foreground)]">
                      <span className="font-semibold">{item.subject}</span>{" "}
                      <span className="text-[var(--muted)]">{item.action}</span>
                      {item.detail && (
                        <span className="font-medium"> {item.detail}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-[var(--muted)]">{item.trip} · {timeAgo(item.at)}</span>
                      {item.amount && (
                        <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">{item.amount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
