"use client";

import type { Expense, Member } from "@/lib/mock-data";

interface ExpensesListProps {
  expenses: Expense[];
  members: Member[];
}

const CATEGORY_BG: Record<Expense["category"], string> = {
  food: "bg-orange-100 text-orange-600",
  transport: "bg-blue-100 text-blue-600",
  activity: "bg-purple-100 text-purple-600",
  accommodation: "bg-green-100 text-green-600",
  other: "bg-stone-100 text-stone-600",
};

const CATEGORY_SVG: Record<Expense["category"], string> = {
  food: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 11-6.9 0l-1.5-.75M3.75 15h.008v.008H3.75V15zm0 0h.008v.008H3.75V15z",
  transport: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  activity: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z",
  accommodation: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  other: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
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
        <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No expenses yet</h3>
        <p className="text-[var(--muted)]">Add your first expense to get started</p>
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
              <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </h3>
              <span className="text-xs font-medium text-[var(--muted)]">₹{dayTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-2 stagger">
              {dayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[var(--border-color)] hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-200 cursor-pointer card-lift"
                >
                  <div className={`w-10 h-10 rounded-xl ${CATEGORY_BG[expense.category]} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_SVG[expense.category]} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--foreground)] text-sm truncate">{expense.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[7px] font-bold text-[var(--primary)]">
                        {getMemberAvatar(expense.paidBy)}
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">
                        {getMemberName(expense.paidBy)} · {expense.splitAmong.length} ways
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-[var(--foreground)] text-sm">₹{expense.baseAmount.toLocaleString()}</div>
                    <div className="text-[11px] text-[var(--muted)]">{expense.amount} {expense.currency}</div>
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
