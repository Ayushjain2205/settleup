"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useActivityFeed } from "@/lib/queries";
import { categoryIcon, categoryStyle, timeFull } from "@/lib/feed";
import { BottomNav } from "@/components/bottom-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";

export default function ActivityPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
        <PullToRefresh onRefresh={() => queryClient.refetchQueries()}>
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
            {feed.map((item) => {
              const Icon = categoryIcon(item.icon);
              return (
              <div key={item.key} className="px-4 py-3 bg-white">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryStyle(item.icon)}`}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--foreground)] border-2 border-white flex items-center justify-center text-[7px] font-bold text-white">
                      {item.actorAvatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--foreground)] leading-snug">
                      <span className="font-semibold">{item.subject}</span>{" "}
                      <span className="text-[var(--muted)]">{item.action}</span>
                      {item.detail && (
                        <span className="font-medium"> {item.detail}</span>
                      )}
                    </div>
                    {item.impact ? (
                      <div className={`text-sm font-semibold tabular-nums mt-0.5 ${item.impact.tone === "good" ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                        {item.impact.text}
                      </div>
                    ) : item.amount ? (
                      <div className="text-xs text-[var(--muted)] tabular-nums mt-0.5">{item.amount}</div>
                    ) : null}
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">{timeFull(item.at)}</div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
        </PullToRefresh>
      </main>

      <BottomNav />
    </div>
  );
}
