"use client";

import type { GroupFormData } from "@/app/groups/new/page";
import { CurrencyPicker } from "@/components/currency-picker";

interface StepCurrencyProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepCurrency({ formData, updateFormData }: StepCurrencyProps) {
  const isInternational = formData.tripType === "international";

  if (!isInternational) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-0.5">Single currency</h2>
          <p className="text-xs text-[var(--muted)]">No conversion needed</p>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Currency</label>
          <CurrencyPicker
            value={formData.baseCurrency}
            onChange={(code) => updateFormData({ baseCurrency: code, spendCurrency: code })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-0.5">Currency setup</h2>
        <p className="text-xs text-[var(--muted)]">How will your group handle foreign currencies?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Base currency</label>
          <p className="text-[10px] text-[var(--muted)]">Debts settle in this</p>
          <CurrencyPicker
            value={formData.baseCurrency}
            onChange={(code) => updateFormData({ baseCurrency: code })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Spend currency</label>
          <p className="text-[10px] text-[var(--muted)]">Default for expenses</p>
          <CurrencyPicker
            value={formData.spendCurrency}
            onChange={(code) => updateFormData({ spendCurrency: code })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Exchange rate</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "fixed" })}
            className={`p-3 rounded-xl text-left transition-colors border ${
              formData.fxMode === "fixed"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                : "border-[var(--border-color)] bg-white"
            }`}
          >
            <div className="text-sm font-semibold text-[var(--foreground)]">Fixed Rate</div>
            <div className="text-[11px] text-[var(--muted)]">Lock a specific rate</div>
          </button>
          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "live" })}
            className={`p-3 rounded-xl text-left transition-colors border ${
              formData.fxMode === "live"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                : "border-[var(--border-color)] bg-white"
            }`}
          >
            <div className="text-sm font-semibold text-[var(--foreground)]">Daily Live</div>
            <div className="text-[11px] text-[var(--muted)]">Fetch rate each day</div>
          </button>
        </div>
      </div>

      {formData.fxMode === "fixed" && (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Rate</label>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-[var(--muted)]">1 {formData.spendCurrency} =</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.fixedFxRate}
              onChange={(e) => updateFormData({ fixedFxRate: parseFloat(e.target.value) || 0 })}
              className="w-32 px-0 py-2 bg-transparent border-0 border-b border-[var(--border-color)] text-xl font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-[var(--muted)]">{formData.baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            100 {formData.spendCurrency} ≈ {(100 * formData.fixedFxRate).toLocaleString()} {formData.baseCurrency}
          </p>
        </div>
      )}
    </div>
  );
}
