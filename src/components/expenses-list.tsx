"use client";

import type { Expense, Member } from "@/lib/mock-data";

interface ExpensesListProps {
  expenses: Expense[];
  members: Member[];
}

const CATEGORY_ICONS: Record<Expense["category"], string> = {
  food: "🍽️",
  transport: "🚗",
  activity: "🎯",
  accommodation: "🏨",
  other: "📦",
};

const CATEGORY_BG: Record<Expense["category"], string> = {
  food: "bg-orange-100",
  transport: "bg-blue-100",
  activity: "bg-purple-100",
  accommodation: "bg-green-100",
  other: "bg-stone-100",
};

export function ExpensesList({ expenses, members }: ExpensesListProps) {
  const groupedByDate = expenses.reduce((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || id;
  const getMemberAvatar = (id: string) => members.find((m) => m.id === id)?.avatar || "?";

  if (expenses.length === 0) {
    return (
      <div className="p-16 text-center rounded-3xl bg-white border border-[var(--border-color)]">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No expenses yet</h3>
        <p className="text-[var(--muted)]">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const dayExpenses = groupedByDate[date];
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.baseAmount, 0);

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
                {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </h3>
              <span className="text-sm font-medium text-[var(--muted)]">₹{dayTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-3 stagger">
              {dayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--border-color)] hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-200 cursor-pointer card-lift"
                >
                  <div className={`w-12 h-12 rounded-2xl ${CATEGORY_BG[expense.category]} flex items-center justify-center text-xl`}>
                    {CATEGORY_ICONS[expense.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--foreground)] truncate">{expense.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[8px] font-bold text-[var(--primary)]">
                        {getMemberAvatar(expense.paidBy)}
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {getMemberName(expense.paidBy)} · {expense.splitAmong.length} ways
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--foreground)]">₹{expense.baseAmount.toLocaleString()}</div>
                    <div className="text-xs text-[var(--muted)]">{expense.amount} {expense.currency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
