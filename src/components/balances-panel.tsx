"use client";

import type { Balance, Member } from "@/lib/mock-data";

interface BalancesPanelProps {
  balances: Balance[];
  members: Member[];
}

export function BalancesPanel({ balances, members }: BalancesPanelProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);
  const sorted = [...balances].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4 stagger">
      {sorted.map((balance) => {
        const member = getMember(balance.memberId);
        if (!member) return null;
        const isPositive = balance.amount > 0;
        const isNegative = balance.amount < 0;

        return (
          <div
            key={balance.memberId}
            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
              isPositive
                ? "bg-[var(--success)]/[0.04] border-[var(--success)]/30"
                : isNegative
                ? "bg-[var(--error)]/[0.04] border-[var(--error)]/30"
                : "bg-white border-[var(--border-color)]"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              isPositive
                ? "bg-[var(--success)]/15 text-[var(--success)]"
                : isNegative
                ? "bg-[var(--error)]/15 text-[var(--error)]"
                : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
            }`}>
              {member.avatar}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--foreground)]">{member.name}</div>
              <div className="text-xs text-[var(--muted)]">
                {isPositive ? "gets back" : isNegative ? "owes" : "settled"}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${
                isPositive ? "text-[var(--success)]" : isNegative ? "text-[var(--error)]" : "text-[var(--muted)]"
              }`}>
                {isPositive ? "+" : ""}₹{Math.abs(balance.amount).toLocaleString()}
              </div>
              {isNegative && (
                <button className="text-xs text-[var(--primary)] font-semibold hover:text-[var(--primary-dim)] transition-colors">
                  Settle
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="p-4 rounded-2xl bg-[var(--primary)]/[0.04] border border-[var(--primary)]/20 mt-6">
        <p className="text-sm text-[var(--foreground)]">
          <span className="font-semibold">Simplified mode</span> minimizes transfers. Only {balances.filter(b => b.amount !== 0).length} payments needed.
        </p>
      </div>
    </div>
  );
}
