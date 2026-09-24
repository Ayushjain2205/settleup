"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecordSettlement } from "@/lib/mutations";
import { errorMessage } from "@/lib/error";
import { success } from "@/lib/haptics";
import { toast } from "@/components/toast";
import type { Settlement, Member } from "@/lib/mock-data";

export interface RecordedPayment {
  from: string;
  to: string;
  amount: number;
  currency: string;
  date: string;
}

interface SettleTabProps {
  groupId: string;
  settlements: Settlement[];
  recorded: RecordedPayment[];
  members: Member[];
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

export function SettleTab({ groupId, settlements, recorded, members }: SettleTabProps) {
  const router = useRouter();
  const recordSettlement = useRecordSettlement(groupId);
  const [recording, setRecording] = useState<string | null>(null);
  const [recordedIds, setRecordedIds] = useState<Set<string>>(new Set());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Server data caught up — drop optimistic marks
  useEffect(() => {
    setRecordedIds(new Set());
  }, [settlements]);

  const visible = settlements.filter((s) => !recordedIds.has(`${s.from}-${s.to}-${s.amount}`));

  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleRecord = (s: Settlement, key: string, amountOverride?: number) => {
    const amount = amountOverride ?? s.amount;
    if (!(amount > 0)) {
      setError("Enter an amount greater than zero");
      return;
    }
    setRecording(key);
    setError(null);
    setRecordedIds((prev) => new Set(prev).add(key));
    setEditingKey(null);
    success();
    recordSettlement.mutate(
      { from: s.from, to: s.to, amount: Math.round(amount * 100) / 100, currency: s.currency },
      {
        onSuccess: () => toast("Payment recorded"),
        onError: (err) => {
          setRecordedIds((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          if (err instanceof Error && err.message === "Not signed in") {
            router.push("/login");
            return;
          }
          setError(errorMessage(err, "Could not record payment"));
        },
        onSettled: () => setRecording(null),
      }
    );
  };

  if (visible.length === 0 && recorded.length === 0) {
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
      {error && (
        <p className="mx-4 mt-4 text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {visible.length > 0 && (
        <>
          {/* Summary */}
          <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">{visible.length} payment{visible.length !== 1 ? "s" : ""} needed</span>
              <span className="text-xs font-medium text-[var(--primary)]">Simplified</span>
            </div>
          </div>

          {/* Settlement list */}
          <div className="divide-y divide-[var(--border-color)]">
            {visible.map((s) => {
              const from = getMember(s.from);
              const to = getMember(s.to);
              if (!from || !to) return null;
              const key = `${s.from}-${s.to}-${s.amount}`;

              return (
                <div key={key} className="list-item bg-white">
                  <div className="w-9 h-9 rounded-full bg-[var(--error)]/10 flex items-center justify-center text-xs font-bold text-[var(--error)] flex-shrink-0">
                    {from.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">{from.name}</span>
                      <svg className="w-4 h-4 text-[var(--muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">{to.name}</span>
                    </div>
                    <div className="text-[11px] text-[var(--muted)] tabular-nums">
                      {symbol(s.currency)}{s.amount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingKey(key);
                      setEditAmount(String(s.amount));
                    }}
                    disabled={recording !== null}
                    className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)] active:bg-[var(--primary)]/20 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    Record
                  </button>
                </div>
              );
            })}
          </div>

          {/* Amount editor sheet */}
          {editingKey && (() => {
            const s = visible.find((x) => `${x.from}-${x.to}-${x.amount}` === editingKey);
            if (!s) return null;
            return (
              <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setEditingKey(null)}>
                <div className="absolute inset-0 bg-black/40" />
                <div
                  className="relative w-full bg-white rounded-t-2xl px-4 pt-4 flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
                >
                  <div className="text-sm font-semibold text-[var(--foreground)] text-center">
                    {getMember(s.from)?.name} → {getMember(s.to)?.name}
                  </div>
                  <p className="text-[11px] text-[var(--muted)] text-center mt-0.5 mb-4">
                    Suggested {symbol(s.currency)}{s.amount.toLocaleString()} · edit what was actually paid
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    <span className="text-xl font-semibold text-[var(--muted)]">{symbol(s.currency)}</span>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      autoFocus
                      className="w-40 text-center text-3xl font-bold text-[var(--foreground)] bg-transparent border-0 border-b-2 border-[var(--primary)] focus:outline-none pb-1 placeholder:text-[var(--border-color)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    onClick={() => handleRecord(s, editingKey, parseFloat(editAmount) || 0)}
                    disabled={recording !== null}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-40"
                  >
                    {recording === editingKey ? "Recording…" : "Confirm payment"}
                  </button>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Recorded history */}
      {recorded.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-2">
            <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Recorded</span>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {recorded.map((r, i) => {
              const from = getMember(r.from);
              const to = getMember(r.to);
              if (!from || !to) return null;
              return (
                <div key={`${r.from}-${r.to}-${r.date}-${i}`} className="list-item bg-white">
                  <div className="w-9 h-9 rounded-full bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--foreground)] truncate">
                      {from.name} → {to.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--foreground)] tabular-nums flex-shrink-0">
                    {symbol(r.currency)}{r.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
