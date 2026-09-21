"use client";

import type { Balance, Member } from "@/lib/mock-data";

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

interface BalancesPanelProps {
  balances: Balance[];
  members: Member[];
}

export function BalancesPanel({ balances, members }: BalancesPanelProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  const sorted = [...balances].sort((a, b) => b.amount - a.amount);
  const maxAbs = Math.max(...sorted.map((b) => Math.abs(b.amount)), 1);

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--border-color)]">
        <span className="text-xs text-[var(--muted)]">Net balances</span>
        <span className="text-xs font-medium text-[var(--muted)]">
          {balances.filter((b) => b.amount > 0).length} getting back · {balances.filter((b) => b.amount < 0).length} owe
        </span>
      </div>

      {/* Balance list */}
      <div className="divide-y divide-[var(--border-color)]">
        {sorted.map((balance) => {
          const member = getMember(balance.memberId);
          if (!member) return null;

          const isPositive = balance.amount > 0;
          const barWidth = Math.max((Math.abs(balance.amount) / maxAbs) * 100, 4);

          return (
            <div key={balance.memberId} className="list-item bg-white">
              <div className="w-9 h-9 rounded-full bg-[var(--foreground)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--foreground)]">{member.name}</div>
                <div className="mt-1.5 h-1 rounded-full bg-[var(--background)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPositive ? "bg-[var(--success)]" : "bg-[var(--error)]"}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
              <div className={`text-sm font-semibold flex-shrink-0 tabular-nums ${isPositive ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                {isPositive ? "+" : ""}{symbol(balance.currency)}{balance.amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
