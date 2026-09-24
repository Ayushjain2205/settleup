"use client";

import { useState } from "react";
import type { Balance, Expense, Member } from "@/lib/mock-data";

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

// Distinct, colorblind-tolerant slice colors
const SLICES = ["#7c3aed", "#f97316", "#16a34a", "#2563eb", "#db2777", "#ca8a04", "#0d9488", "#6b7280"];

interface SpendingProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
}

function Spending({ expenses, members, currency }: SpendingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totals = members.map((m, i) => ({
    member: m,
    color: SLICES[i % SLICES.length],
    total: expenses.filter((e) => e.paidBy === m.id).reduce((s, e) => s + e.baseAmount, 0),
  }));
  const grand = totals.reduce((s, t) => s + t.total, 0);
  if (grand <= 0) return null;

  const selected = selectedId ? totals.find((t) => t.member.id === selectedId) : null;
  const selectedExpenses = selectedId
    ? expenses.filter((e) => e.paidBy === selectedId).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  // SVG doughnut: r=15.9155 → circumference 100, offsets accumulate
  let offset = 25;
  return (
    <div className="bg-white border-b border-[var(--border-color)]">
      <div className="px-4 pt-3 pb-1">
        <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Spending</span>
      </div>
      <div className="flex items-center gap-4 px-4 py-2">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 42 42" className="w-28 h-28 -rotate-90">
            {totals.map((t) => {
              if (t.total <= 0) return null;
              const pct = (t.total / grand) * 100;
              const el = (
                <circle
                  key={t.member.id}
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="none"
                  strokeWidth="7"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={offset}
                  stroke={t.color}
                  strokeLinecap="butt"
                  onClick={() => setSelectedId(selectedId === t.member.id ? null : t.member.id)}
                  style={{ cursor: "pointer" }}
                />
              );
              offset -= pct;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-[var(--foreground)] tabular-nums">
              {symbol(currency)}{grand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] text-[var(--muted)]">total</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 divide-y divide-[var(--border-color)]/60">
          {totals.map((t) => (
            <button
              key={t.member.id}
              onClick={() => setSelectedId(selectedId === t.member.id ? null : t.member.id)}
              className="w-full flex items-center gap-2 py-1.5 text-left"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className={`flex-1 text-xs truncate ${selectedId === t.member.id ? "font-bold text-[var(--foreground)]" : "font-medium text-[var(--muted)]"}`}>
                {t.member.name}
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
                {symbol(currency)}{t.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-person expense drilldown */}
      {selected && (
        <div className="border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-[11px] font-semibold text-[var(--foreground)]">
              {selected.member.name} · {symbol(currency)}{selected.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <button onClick={() => setSelectedId(null)} className="text-[11px] font-semibold text-[var(--primary)]">
              Clear
            </button>
          </div>
          <div className="divide-y divide-[var(--border-color)]/60">
            {selectedExpenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2">
                <span className="flex-1 text-xs font-medium text-[var(--foreground)] truncate">{e.title}</span>
                <span className="text-[10px] text-[var(--muted)]">
                  {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">
                  {symbol(currency)}{e.baseAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
            {selectedExpenses.length === 0 && (
              <div className="px-4 py-3 text-[11px] text-[var(--muted)]">No expenses paid yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface BalancesPanelProps {
  balances: Balance[];
  members: Member[];
  expenses?: Expense[];
}

export function BalancesPanel({ balances, members, expenses }: BalancesPanelProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  const sorted = [...balances].sort((a, b) => b.amount - a.amount);
  const maxAbs = Math.max(...sorted.map((b) => Math.abs(b.amount)), 1);
  const currency = balances[0]?.currency || "INR";

  return (
    <div>
      {expenses && expenses.length > 0 && (
        <Spending expenses={expenses} members={members} currency={currency} />
      )}
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
