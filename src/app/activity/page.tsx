"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActivityFeed } from "@/lib/queries";
import { BottomNav } from "@/components/bottom-nav";

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

export default function ActivityPage() {
  const router = useRouter();
  const { session, sessionLoading, data: feed, isLoading } = useActivityFeed();

  useEffect(() => {
    if (!sessionLoading && !session) router.replace("/landing");
  }, [sessionLoading, session, router]);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Activity</h1>
        </div>
      </header>

      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        {isLoading || sessionLoading ? (
          <div className="animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--border-color)] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-[var(--border-color)]" />
                    <div className="h-2.5 w-1/2 rounded bg-[var(--border-color)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !feed || feed.length === 0 ? (
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
