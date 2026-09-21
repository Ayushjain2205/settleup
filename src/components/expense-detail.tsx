"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/error";
import { tick } from "@/lib/haptics";
import { toast } from "@/components/toast";
import type { Expense, Member } from "@/lib/mock-data";

interface ExpenseDetailProps {
  groupId: string;
  expense: Expense;
  members: Member[];
  splits: { memberId: string; amount: number }[];
  onClose: () => void;
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

export function ExpenseDetail({ groupId, expense, members, splits, onClose }: ExpenseDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const payer = getMember(expense.paidBy);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${expense.title}"? This can't be undone.`)) return;
    setIsDeleting(true);
    setError(null);
    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
    if (error) {
      setError(errorMessage(error, "Could not delete expense"));
      setIsDeleting(false);
      return;
    }
    onClose();
    router.refresh();
    tick();
    toast("Expense deleted");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
          <button onClick={onClose} className="text-sm font-semibold text-[var(--primary)]">
            Close
          </button>
          <span className="text-base font-semibold text-[var(--foreground)]">Expense</span>
          <button
            onClick={() => router.push(`/trip/${groupId}/expenses/${expense.id}/edit`)}
            className="text-sm font-semibold text-[var(--primary)]"
          >
            Edit
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-4 py-4 border-b border-[var(--border-color)]">
            <div className="text-lg font-bold text-[var(--foreground)] tracking-tight">{expense.title}</div>
            <div className="text-2xl font-bold text-[var(--foreground)] tabular-nums mt-1">
              {symbol(expense.baseCurrency)}{expense.baseAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-1">
              {new Date(expense.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              {" · "}Paid by {payer?.name || "someone"}
            </div>
          </div>

          <div className="px-4 py-2">
            <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Split</span>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {splits.map((s) => {
              const m = getMember(s.memberId);
              if (!m) return null;
              return (
                <div key={s.memberId} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--primary)] flex-shrink-0">
                    {m.avatar}
                  </div>
                  <span className="flex-1 text-sm font-medium text-[var(--foreground)]">{m.name}</span>
                  <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                    {symbol(expense.baseCurrency)}{s.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="mx-4 mt-4 text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="px-4 pt-4">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-2.5 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl text-xs font-semibold text-[var(--error)] disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete expense"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
