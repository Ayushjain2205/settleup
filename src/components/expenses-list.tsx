"use client";

import type { Expense, Member } from "@/lib/mock-data";

interface ExpensesListProps {
  expenses: Expense[];
  members: Member[];
  baseCurrency?: string;
}

const CATEGORY_ICONS: Record<Expense["category"], string> = {
  food: "🍽️",
  transport: "🚗",
  activity: "🎯",
  accommodation: "🏨",
  other: "📦",
};

const CATEGORY_COLORS: Record<Expense["category"], string> = {
  food: "bg-orange-100 text-orange-700",
  transport: "bg-blue-100 text-blue-700",
  activity: "bg-purple-100 text-purple-700",
  accommodation: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-700",
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
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] mb-2">No expenses yet</h3>
        <p className="text-sm text-[var(--muted)]">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayExpenses = groupedByDate[date];
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.baseAmount, 0);

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--muted)]">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <span className="text-sm text-[var(--muted)]">
                ₹{dayTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              {dayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${CATEGORY_COLORS[expense.category]}`}>
                      {CATEGORY_ICONS[expense.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[var(--foreground)] truncate">
                          {expense.title}
                        </h4>
                        <span className="font-semibold text-[var(--foreground)] ml-2">
                          ₹{expense.baseAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-semibold text-[var(--primary)]">
                          {getMemberAvatar(expense.paidBy)}
                        </div>
                        <span className="text-xs text-[var(--muted)]">
                          Paid by {getMemberName(expense.paidBy)}
                        </span>
                        <span className="text-xs text-[var(--muted)]">•</span>
                        <span className="text-xs text-[var(--muted)]">
                          Split {expense.splitAmong.length} ways
                        </span>
                      </div>
                    </div>
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
