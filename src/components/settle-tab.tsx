"use client";

import type { Settlement, Member } from "@/lib/mock-data";

interface SettleTabProps {
  settlements: Settlement[];
  members: Member[];
}

export function SettleTab({ settlements, members }: SettleTabProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  if (settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">All settled up</p>
        <p className="text-xs text-[var(--muted)] mt-1">No pending payments</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">{settlements.length} payment{settlements.length !== 1 ? "s" : ""} needed</span>
          <span className="text-xs font-medium text-[var(--primary)]">Simplified</span>
        </div>
      </div>

      {/* Settlement list */}
      <div className="divide-y divide-[var(--border-color)]">
        {settlements.map((s, i) => {
          const from = getMember(s.from);
          const to = getMember(s.to);
          if (!from || !to) return null;

          return (
            <div key={i} className="list-item bg-white">
              {/* From avatar */}
              <div className="w-9 h-9 rounded-full bg-[var(--error)]/10 flex items-center justify-center text-xs font-bold text-[var(--error)] flex-shrink-0">
                {from.avatar}
              </div>

              {/* Arrow + amount */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">{from.name}</span>
                  <svg className="w-4 h-4 text-[var(--muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">{to.name}</span>
                </div>
              </div>

              {/* To avatar + amount */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-[var(--foreground)]">₹{s.amount.toLocaleString()}</span>
                <div className="w-9 h-9 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-xs font-bold text-[var(--success)]">
                  {to.avatar}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settle all button */}
      <div className="p-4">
        <button className="w-full py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold active:opacity-80 transition-opacity">
          Settle all via UPI
        </button>
      </div>
    </div>
  );
}
