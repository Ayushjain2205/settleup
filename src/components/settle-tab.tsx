"use client";

import type { Settlement, Member } from "@/lib/mock-data";

interface SettleTabProps {
  settlements: Settlement[];
  members: Member[];
  baseCurrency?: string;
}

export function SettleTab({ settlements, members }: SettleTabProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  if (settlements.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="w-16 h-16 bg-[var(--success)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] mb-2">All settled up!</h3>
        <p className="text-sm text-[var(--muted)]">No payments needed right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="font-semibold text-[var(--foreground)] mb-2">Settlement Plan</h3>
        <p className="text-sm text-[var(--muted)] mb-6">
          {settlements.length} transfer{settlements.length !== 1 ? "s" : ""} to settle all debts
        </p>

        <div className="space-y-4">
          {settlements.map((settlement, index) => {
            const from = getMember(settlement.from);
            const to = getMember(settlement.to);

            if (!from || !to) return null;

            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]"
              >
                {/* From */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[var(--error)]/10 flex items-center justify-center text-sm font-semibold text-[var(--error)]">
                    {from.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--foreground)]">{from.name}</div>
                    <div className="text-xs text-[var(--error)]">pays</div>
                  </div>
                </div>

                {/* Arrow + Amount */}
                <div className="flex flex-col items-center px-4">
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    ₹{settlement.amount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--muted)]">
                    <div className="w-8 h-px bg-[var(--border)]" />
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="w-8 h-px bg-[var(--border)]" />
                  </div>
                </div>

                {/* To */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-right">
                    <div className="font-medium text-[var(--foreground)]">{to.name}</div>
                    <div className="text-xs text-[var(--success)]">receives</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-sm font-semibold text-[var(--success)]">
                    {to.avatar}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Pay via UPI
        </button>

        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-xl font-medium hover:bg-[var(--background)] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark Settled
        </button>
      </div>

      <div className="p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
        <div className="flex items-start gap-3">
          <span className="text-lg">💬</span>
          <div className="text-sm text-[var(--foreground)]">
            <span className="font-semibold">WhatsApp summary:</span> Share a formatted summary with your group after settling up.
          </div>
        </div>
      </div>
    </div>
  );
}
