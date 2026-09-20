"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepCurrencyProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

const CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

export function StepCurrency({ formData, updateFormData }: StepCurrencyProps) {
  const isInternational = formData.tripType === "international";

  if (!isInternational) {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">Single currency</h2>
          <p className="text-[var(--muted)] text-lg">No conversion needed</p>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Currency</label>
          <select
            value={formData.baseCurrency}
            onChange={(e) => updateFormData({ baseCurrency: e.target.value, spendCurrency: e.target.value })}
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[var(--border-color)] text-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">Currency setup</h2>
        <p className="text-[var(--muted)] text-lg">How will your group handle foreign currencies?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Base currency</label>
          <p className="text-xs text-[var(--muted)]">Debts settle in this</p>
          <select
            value={formData.baseCurrency}
            onChange={(e) => updateFormData({ baseCurrency: e.target.value })}
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[var(--border-color)] text-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Spend currency</label>
          <p className="text-xs text-[var(--muted)]">Default for new expenses</p>
          <select
            value={formData.spendCurrency}
            onChange={(e) => updateFormData({ spendCurrency: e.target.value })}
            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[var(--border-color)] text-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Exchange rate</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "fixed" })}
            className={`relative p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
              formData.fxMode === "fixed"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04] shadow-sm"
                : "border-[var(--border-color)] bg-white hover:border-[var(--primary)]/40"
            }`}
          >
            <div className="font-bold text-[var(--foreground)]">Fixed Rate</div>
            <div className="text-sm text-[var(--muted)] mt-1">Lock a specific rate</div>
            {formData.fxMode === "fixed" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "live" })}
            className={`relative p-5 rounded-2xl text-left transition-all duration-200 border-2 ${
              formData.fxMode === "live"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04] shadow-sm"
                : "border-[var(--border-color)] bg-white hover:border-[var(--primary)]/40"
            }`}
          >
            <div className="font-bold text-[var(--foreground)]">Daily Live</div>
            <div className="text-sm text-[var(--muted)] mt-1">Fetch rate each day</div>
            {formData.fxMode === "live" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {formData.fxMode === "fixed" && (
        <div className="space-y-4 animate-fade-up">
          <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Rate</label>
          <div className="flex items-baseline gap-3">
            <span className="text-[var(--muted)] text-lg">1 {formData.spendCurrency} =</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.fixedFxRate}
              onChange={(e) => updateFormData({ fixedFxRate: parseFloat(e.target.value) || 0 })}
              className="w-40 px-0 py-4 bg-transparent border-0 border-b-2 border-[var(--border-color)] text-3xl font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[var(--muted)] text-lg">{formData.baseCurrency}</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            100 {formData.spendCurrency} ≈ {(100 * formData.fixedFxRate).toLocaleString()} {formData.baseCurrency}
          </p>
        </div>
      )}
    </div>
  );
}
