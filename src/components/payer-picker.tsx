"use client";

import { useState } from "react";

interface PayerPickerProps {
  members: { id: string; name: string; avatar: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Entered-currency total, used to validate multi-payer splits */
  amount?: number;
  symbol?: string;
  /** MemberId -> entered amount string. Presence of 2+ entries opens in multi mode. */
  initialPayers?: Record<string, string>;
  onSelectMulti?: (payers: Record<string, string>) => void;
}

export function PayerPicker({
  members,
  selected,
  onSelect,
  onClose,
  amount = 0,
  symbol = "",
  initialPayers = {},
  onSelectMulti,
}: PayerPickerProps) {
  const [selection, setSelection] = useState(selected);
  const hasInitialMulti = Object.values(initialPayers).filter((v) => (parseFloat(v) || 0) > 0).length > 1;
  const [multi, setMulti] = useState(hasInitialMulti);
  const [amounts, setAmounts] = useState<Record<string, string>>(initialPayers);

  const handleConfirm = () => {
    onSelect(selection);
    onClose();
  };

  const toggleMultiMember = (id: string) => {
    setAmounts((prev) => {
      const next = { ...prev };
      if ((parseFloat(next[id]) || 0) > 0 || next[id]?.trim()) {
        delete next[id];
      } else {
        // Pre-fill with remaining divided among newly added, or empty for typing
        next[id] = "";
      }
      return next;
    });
  };

  const totalPaid = Object.values(amounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const remaining = amount - totalPaid;
  const activePayers = Object.entries(amounts).filter(([, v]) => (parseFloat(v) || 0) > 0 || v?.trim());
  const multiValid = amount > 0 && Math.abs(remaining) < 0.01 && activePayers.length > 0;

  const splitEqually = () => {
    const ids = members.map((m) => m.id);
    const share = amount > 0 ? Math.floor((amount / ids.length) * 100) / 100 : 0;
    const next: Record<string, string> = {};
    ids.forEach((id, i) => {
      if (i < ids.length - 1) next[id] = String(share);
      else next[id] = String(Math.round((amount - share * (ids.length - 1)) * 100) / 100);
    });
    setAmounts(next);
  };

  const handleMultiConfirm = () => {
    if (!multiValid) return;
    const cleaned: Record<string, string> = {};
    for (const [id, v] of Object.entries(amounts)) {
      if ((parseFloat(v) || 0) > 0) cleaned[id] = v;
    }
    if (onSelectMulti) onSelectMulti(cleaned);
    else if (Object.keys(cleaned).length === 1) onSelect(Object.keys(cleaned)[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
          {multi ? (
            <button onClick={() => setMulti(false)} className="text-sm font-semibold text-[var(--primary)]">
              Back
            </button>
          ) : (
            <button onClick={onClose} className="text-sm font-semibold text-[var(--primary)]">
              Cancel
            </button>
          )}
          <span className="text-base font-semibold text-[var(--foreground)]">
            {multi ? "Multiple payers" : "Choose payer"}
          </span>
          {multi ? (
            <button
              onClick={handleMultiConfirm}
              disabled={!multiValid}
              className="text-sm font-semibold text-[var(--primary)] disabled:opacity-40"
            >
              Done
            </button>
          ) : (
            <button onClick={handleConfirm} className="text-sm font-semibold text-[var(--primary)]">
              Done
            </button>
          )}
        </div>

        {multi ? (
          <>
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">
                Total {symbol}
                {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <button onClick={splitEqually} className="text-xs font-semibold text-[var(--primary)]">
                Split equally
              </button>
            </div>
            <div
              className={`mx-4 mb-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                Math.abs(remaining) < 0.01 ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--error)]/5 text-[var(--error)]"
              }`}
            >
              {Math.abs(remaining) < 0.01
                ? "Balanced — payers cover the full amount"
                : remaining > 0
                  ? `${symbol}${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 2 })} left to assign`
                  : `${symbol}${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 2 })} over`}
            </div>
            <div className="overflow-y-auto flex-1">
              {members.map((member) => {
                const checked = amounts[member.id] !== undefined;
                return (
                  <div
                    key={member.id}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]/50"
                  >
                    <button
                      onClick={() => toggleMultiMember(member.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        checked ? "bg-[var(--primary)]" : "border-2 border-[var(--border-color)]"
                      }`}
                      aria-label={`Toggle ${member.name}`}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)] flex-shrink-0">
                      {member.avatar}
                    </div>
                    <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
                    {checked ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[var(--muted)]">{symbol}</span>
                        <input
                          type="number"
                          value={amounts[member.id] || ""}
                          onChange={(e) => setAmounts((prev) => ({ ...prev, [member.id]: e.target.value }))}
                          placeholder="0"
                          className="w-24 text-right text-[15px] font-semibold text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border-color)] focus:border-[var(--primary)] focus:outline-none pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">Not paying</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)]" style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}>
              <button
                onClick={handleMultiConfirm}
                disabled={!multiValid}
                className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-bold disabled:opacity-40"
              >
                Confirm payers
              </button>
            </div>
          </>
        ) : (
          /* Member list */
          <div className="overflow-y-auto flex-1">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelection(member.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]/50 active:bg-[var(--background)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                  {member.avatar}
                </div>
                <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
                {selection === member.id && (
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button
              onClick={() => setMulti(true)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]/50 active:bg-[var(--background)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--border-color)]/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">Multiple people</span>
              <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
