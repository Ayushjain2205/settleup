"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepBasicsProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepBasics({ formData, updateFormData }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-0.5">Name your trip</h2>
        <p className="text-xs text-[var(--muted)]">Something everyone will recognize</p>
      </div>

      <input
        type="text"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Malaysia Trip 2026"
        className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--border-color)] text-base text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
        autoFocus
      />

      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Trip type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateFormData({ tripType: "domestic" })}
            className={`relative p-3 rounded-xl text-left transition-colors border ${
              formData.tripType === "domestic"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                : "border-[var(--border-color)] bg-white"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-[var(--foreground)]">Domestic</div>
            <div className="text-[11px] text-[var(--muted)]">Same currency</div>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ tripType: "international" })}
            className={`relative p-3 rounded-xl text-left transition-colors border ${
              formData.tripType === "international"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                : "border-[var(--border-color)] bg-white"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-[var(--foreground)]">International</div>
            <div className="text-[11px] text-[var(--muted)]">Multiple currencies</div>
          </button>
        </div>
      </div>
    </div>
  );
}
