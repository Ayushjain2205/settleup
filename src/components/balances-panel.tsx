"use client";

import type { Balance, Member } from "@/lib/mock-data";

interface BalancesPanelProps {
  balances: Balance[];
  members: Member[];
  baseCurrency?: string;
}

export function BalancesPanel({ balances, members }: BalancesPanelProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  const sorted = [...balances].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      <h3 className="font-semibold text-[var(--foreground)] mb-4">Net Balances</h3>
      <p className="text-sm text-[var(--muted)] mb-6">
        Positive means owed money, negative means owes money
      </p>

      <div className="space-y-4">
        {sorted.map((balance) => {
          const member = getMember(balance.memberId);
          if (!member) return null;

          const isPositive = balance.amount > 0;
          const isNegative = balance.amount < 0;

          return (
            <div
              key={balance.memberId}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-semibold text-[var(--primary)]">
                  {member.avatar}
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">{member.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {isPositive ? "gets back" : isNegative ? "owes" : "settled"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-lg font-bold ${
                    isPositive
                      ? "text-[var(--success)]"
                      : isNegative
                      ? "text-[var(--error)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  {isPositive ? "+" : ""}₹{Math.abs(balance.amount).toLocaleString()}
                </div>
                {!isPositive && (
                  <button className="text-xs text-[var(--primary)] font-medium hover:underline">
                    Settle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="text-sm text-[var(--foreground)]">
            <span className="font-semibold">Simplified mode</span> is on. We minimize the number of transfers needed to settle all debts.
          </div>
        </div>
      </div>
    </div>
  );
}
