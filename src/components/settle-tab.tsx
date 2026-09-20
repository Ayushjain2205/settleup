"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const [recording, setRecording] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleRecord = async (s: Settlement, key: string) => {
    setRecording(key);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { error } = await supabase.from("settlements").insert({
        group_id: groupId,
        from_member: s.from,
        to_member: s.to,
        amount: s.amount,
        currency: s.currency,
        status: "confirmed",
        created_by: user.id,
      });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record payment");
    } finally {
      setRecording(null);
    }
  };

  if (settlements.length === 0 && recorded.length === 0) {
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

      {settlements.length > 0 && (
        <>
          {/* Summary */}
          <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">{settlements.length} payment{settlements.length !== 1 ? "s" : ""} needed</span>
              <span className="text-xs font-medium text-[var(--primary)]">Simplified</span>
            </div>
          </div>

          {/* Settlement list */}
          <div className="divide-y divide-[var(--border-color)]">
            {settlements.map((s) => {
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
                    onClick={() => handleRecord(s, key)}
                    disabled={recording !== null}
                    className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)] active:bg-[var(--primary)]/20 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    {recording === key ? "..." : "Record"}
                  </button>
                </div>
              );
            })}
          </div>
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
