"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepDebtsProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepDebts({ formData, updateFormData }: StepDebtsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1">Debt simplification</h2>
        <p className="text-[var(--muted)]">How should we handle who owes whom?</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => updateFormData({ simplifyDebts: true })}
          className={`w-full relative p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
            formData.simplifyDebts
              ? "border-[var(--success)] bg-[var(--success)]/[0.04] shadow-sm"
              : "border-[var(--border-color)] bg-white hover:border-[var(--success)]/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              formData.simplifyDebts ? "bg-gradient-to-br from-[var(--success)] to-emerald-400" : "bg-[var(--success)]/10"
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--foreground)]">Simplified</div>
              <div className="text-sm text-[var(--muted)] mt-0.5">Minimize transfers. A owes B, B owes C? Route A → C directly.</div>
              <div className="flex gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--success)]/10 text-[var(--success)]">Fewer transfers</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--primary)]/10 text-[var(--primary)]">Smart routing</span>
              </div>
            </div>
          </div>
          {formData.simplifyDebts && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => updateFormData({ simplifyDebts: false })}
          className={`w-full relative p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
            !formData.simplifyDebts
              ? "border-[var(--accent)] bg-[var(--accent)]/[0.04] shadow-sm"
              : "border-[var(--border-color)] bg-white hover:border-[var(--accent)]/40"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              !formData.simplifyDebts ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-bright)]" : "bg-[var(--accent)]/10"
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--foreground)]">Direct</div>
              <div className="text-sm text-[var(--muted)] mt-0.5">Everyone pays exactly who they owe. No third-party routing.</div>
              <div className="flex gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">Fully transparent</span>
              </div>
            </div>
          </div>
          {!formData.simplifyDebts && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-[var(--muted)]">You can change this anytime in group settings.</p>

      {/* Summary */}
      <div className="p-4 rounded-2xl bg-white border border-[var(--border-color)]">
        <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Name</span>
            <span className="font-semibold text-[var(--foreground)]">{formData.name || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Type</span>
            <span className="font-semibold text-[var(--foreground)]">
              {formData.tripType === "international" ? "International" : "Domestic"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Currencies</span>
            <span className="font-semibold text-[var(--foreground)]">
              {formData.tripType === "international" ? `${formData.spendCurrency} → ${formData.baseCurrency}` : formData.baseCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Debt mode</span>
            <span className="font-semibold text-[var(--foreground)]">
              {formData.simplifyDebts ? "Simplified" : "Direct"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
