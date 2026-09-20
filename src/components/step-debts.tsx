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
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Debt simplification</h2>
        <p className="text-[var(--muted)] mt-1">How should we handle who owes whom?</p>
      </div>

      <div className="space-y-4">
        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            formData.simplifyDebts
              ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
              : "border-[var(--border)] hover:border-[var(--primary)]/50"
          }`}
          onClick={() => updateFormData({ simplifyDebts: true })}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                formData.simplifyDebts
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}
            >
              {formData.simplifyDebts && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-semibold text-[var(--foreground)]">Simplified (Recommended)</div>
              <div className="text-sm text-[var(--muted)] mt-1">
                Minimizes the number of payments. If A owes B and B owes C, 
                we route directly A → C instead of two transfers.
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/10 text-[var(--success)]">
                  Fewer transfers
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                  Smart routing
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            !formData.simplifyDebts
              ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
              : "border-[var(--border)] hover:border-[var(--primary)]/50"
          }`}
          onClick={() => updateFormData({ simplifyDebts: false })}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                !formData.simplifyDebts
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}
            >
              {!formData.simplifyDebts && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-semibold text-[var(--foreground)]">Direct (Pairwise)</div>
              <div className="text-sm text-[var(--muted)] mt-1">
                Every person pays exactly who they owe. No third-party routing — 
                transparent but may require more transfers.
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                  Fully transparent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="text-sm text-[var(--muted)]">
            You can change this anytime in group settings. The choice affects how 
            the &quot;Settle Up&quot; tab calculates payments.
          </div>
        </div>
      </div>

      <div className="p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)] mb-3">Group Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Name</dt>
            <dd className="font-medium text-[var(--foreground)]">{formData.name || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Type</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {formData.tripType === "international" ? "✈️ International" : "🏠 Domestic"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Currencies</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {formData.tripType === "international"
                ? `${formData.spendCurrency} → ${formData.baseCurrency}`
                : formData.baseCurrency}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">FX Mode</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {formData.tripType === "international"
                ? formData.fxMode === "fixed"
                  ? `Fixed @ ${formData.fixedFxRate}`
                  : "Daily Live"
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Debt Mode</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {formData.simplifyDebts ? "Simplified" : "Direct Pairwise"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
