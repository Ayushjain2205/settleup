"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteExpense } from "@/lib/mutations";
import { success } from "@/lib/haptics";
import { toast } from "@/components/toast";
import type { Expense, Member } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/categories";
import { ExpenseDetail } from "./expense-detail";
import { SwipeRow } from "./swipe-row";

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

interface ExpensesListProps {
  expenses: Expense[];
  members: Member[];
  splitDetails: Record<string, { memberId: string; amount: number }[]>;
  groupId: string;
}

const BROAD_ICON = Object.fromEntries(
  CATEGORIES.filter((c) => c.id === "dining_out" || c.id === "taxi" || c.id === "movies" || c.id === "rent" || c.id === "other")
    .map((c) => [c.broad === "food" ? "food" : c.broad === "transport" ? "transport" : c.broad === "activity" ? "activity" : c.broad === "accommodation" ? "accommodation" : "other", c])
);

const BROAD_COLOR: Record<string, string> = {
  food: "bg-orange-50 text-orange-600",
  transport: "bg-blue-50 text-blue-600",
  activity: "bg-purple-50 text-purple-600",
  accommodation: "bg-green-50 text-green-600",
  other: "bg-stone-50 text-stone-600",
};

export function ExpensesList({ expenses, members, splitDetails, groupId }: ExpensesListProps) {
  const groupedByDate = expenses.reduce((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name || id;
  const [openId, setOpenId] = useState<string | null>(null);
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteExpense = useDeleteExpense(groupId);
  const openExpense = openId ? expenses.find((e) => e.id === openId) || null : null;

  const handleSwipeDelete = (id: string) => {
    setDeletingId(id);
    setSwipeOpenId(null);
    success();
    deleteExpense.mutate(id, {
      onSuccess: () => toast("Expense deleted"),
      onError: (err) => toast(err instanceof Error ? err.message : "Could not delete expense"),
      onSettled: () => setDeletingId(null),
    });
  };

  const handleDetailDeleted = () => {
    success();
    toast("Expense deleted");
  };

  const getIcon = (broad: string) => {
    const cat = BROAD_ICON[broad];
    return cat || BROAD_ICON.other;
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">No expenses yet</p>
        <p className="text-xs text-[var(--muted)] mt-1">Tap + to add your first expense</p>
      </div>
    );
  }

  return (
    <div>
      {sortedDates.map((date) => {
        const dayExpenses = groupedByDate[date];
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.baseAmount, 0);

        return (
          <div key={date}>
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--background)]">
              <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                {new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="text-[11px] font-semibold text-[var(--muted)] tabular-nums">{dayExpenses.length > 0 ? `${symbol(dayExpenses[0].baseCurrency)}${dayTotal.toLocaleString()}` : ""}</span>
            </div>

            <div className="divide-y divide-[var(--border-color)]">
              {dayExpenses.map((expense) => {
                const cat = getIcon(expense.category);
                const IconComp = cat.Icon;
                const swipedOpen = swipeOpenId === expense.id;
                return (
                  <SwipeRow
                    key={expense.id}
                    id={expense.id}
                    openId={swipeOpenId}
                    onOpenChange={setSwipeOpenId}
                    onDelete={handleSwipeDelete}
                    deletingId={deletingId}
                  >
                    <div
                      onClick={() => (swipedOpen ? setSwipeOpenId(null) : setOpenId(expense.id))}
                      className="w-full list-item bg-white active:bg-[var(--background)] transition-colors text-left cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg ${BROAD_COLOR[expense.category]} flex items-center justify-center flex-shrink-0`}>
                      <IconComp className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--foreground)] truncate">{expense.title}</div>
                      <div className="text-[11px] text-[var(--muted)]">
                        {getMemberName(expense.paidBy)} · {expense.splitAmong.length} ways
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-[var(--foreground)] tabular-nums">{symbol(expense.baseCurrency)}{expense.baseAmount.toLocaleString()}</div>
                    </div>
                    </div>
                  </SwipeRow>
                );
              })}
            </div>
          </div>
        );
      })}
      {openExpense && (
        <ExpenseDetail
          groupId={groupId}
          expense={openExpense}
          members={members}
          splits={splitDetails[openExpense.id] || []}
          onClose={() => setOpenId(null)}
          onDeleted={handleDetailDeleted}
        />
      )}
    </div>
  );
}
