"use client";

import type { Settlement, Member } from "@/lib/mock-data";

interface SettleTabProps {
  settlements: Settlement[];
  members: Member[];
}

export function SettleTab({ settlements, members }: SettleTabProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  if (settlements.length === 0) {
    return (
      <div className="p-16 text-center rounded-3xl bg-white border border-[var(--border-color)]">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">All settled up!</h3>
        <p className="text-[var(--muted)]">No payments needed right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-[var(--border-color)]">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Settlement Plan</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            {settlements.length} transfer{settlements.length !== 1 ? "s" : ""} to settle all debts
          </p>
        </div>

        <div className="space-y-4">
          {settlements.map((settlement, index) => {
            const from = getMember(settlement.from);
            const to = getMember(settlement.to);
            if (!from || !to) return null;

            return (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--background)] border border-[var(--border-color)]"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[var(--error)]/10 flex items-center justify-center text-sm font-bold text-[var(--error)]">
                    {from.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--foreground)]">{from.name}</div>
                    <div className="text-xs text-[var(--error)]">pays</div>
                  </div>
                </div>

                <div className="flex flex-col items-center px-4">
                  <div className="text-2xl font-bold text-[var(--foreground)] mb-1">₹{settlement.amount.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <div className="w-6 h-px bg-[var(--border-color)]" />
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="w-6 h-px bg-[var(--border-color)]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-bold text-[var(--foreground)]">{to.name}</div>
                    <div className="text-xs text-[var(--success)]">receives</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-sm font-bold text-[var(--success)]">
                    {to.avatar}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] text-white rounded-2xl font-semibold hover:opacity-90 transition-all btn-press shadow-md shadow-[var(--accent)]/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Pay via UPI
        </button>

        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-[var(--border-color)] text-[var(--foreground)] rounded-2xl font-medium hover:bg-[var(--foreground)]/[0.03] transition-all btn-press shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark Settled
        </button>
      </div>
    </div>
  );
}
