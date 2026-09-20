"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepDebtsProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepDebts({ formData, updateFormData }: StepDebtsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-0.5">Debt simplification</h2>
        <p className="text-xs text-[var(--muted)]">How should we handle who owes whom?</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => updateFormData({ simplifyDebts: true })}
          className={`w-full p-4 rounded-xl text-left transition-colors border ${
            formData.simplifyDebts
              ? "border-[var(--success)] bg-[var(--success)]/[0.04]"
              : "border-[var(--border-color)] bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              formData.simplifyDebts ? "bg-[var(--success)] text-white" : "bg-[var(--success)]/10 text-[var(--success)]"
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">Simplified</div>
              <div className="text-[11px] text-[var(--muted)]">Minimize transfers with smart routing</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => updateFormData({ simplifyDebts: false })}
          className={`w-full p-4 rounded-xl text-left transition-colors border ${
            !formData.simplifyDebts
              ? "border-[var(--accent)] bg-[var(--accent)]/[0.04]"
              : "border-[var(--border-color)] bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              !formData.simplifyDebts ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)]/10 text-[var(--accent)]"
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">Direct</div>
              <div className="text-[11px] text-[var(--muted)]">Everyone pays exactly who they owe</div>
            </div>
          </div>
        </button>
      </div>

      {/* Summary */}
      <div className="p-3 rounded-xl bg-white border border-[var(--border-color)]">
        <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Summary</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Name</span>
            <span className="font-medium text-[var(--foreground)]">{formData.name || "—"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Type</span>
            <span className="font-medium text-[var(--foreground)]">
              {formData.tripType === "international" ? "International" : "Domestic"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Currencies</span>
            <span className="font-medium text-[var(--foreground)]">
              {formData.tripType === "international" ? `${formData.spendCurrency} → ${formData.baseCurrency}` : formData.baseCurrency}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">Debt mode</span>
            <span className="font-medium text-[var(--foreground)]">
              {formData.simplifyDebts ? "Simplified" : "Direct"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
