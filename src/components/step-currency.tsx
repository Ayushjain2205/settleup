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
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Single currency</h2>
          <p className="text-[var(--muted)] mt-1">Domestic trips use one currency — no conversion needed</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="base-currency" className="block text-sm font-medium text-[var(--foreground)]">
            Currency
          </label>
          <select
            id="base-currency"
            value={formData.baseCurrency}
            onChange={(e) => updateFormData({ baseCurrency: e.target.value, spendCurrency: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20">
          <p className="text-sm text-[var(--foreground)]">
            All expenses will be in <span className="font-semibold">{formData.baseCurrency}</span>. 
            Skip to the next step to configure debt simplification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Currency setup</h2>
        <p className="text-[var(--muted)] mt-1">How will your group handle foreign currencies?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="base-currency" className="block text-sm font-medium text-[var(--foreground)]">
            Base Currency
          </label>
          <p className="text-xs text-[var(--muted)]">Debts settle in this</p>
          <select
            id="base-currency"
            value={formData.baseCurrency}
            onChange={(e) => updateFormData({ baseCurrency: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="spend-currency" className="block text-sm font-medium text-[var(--foreground)]">
            Spend Currency
          </label>
          <p className="text-xs text-[var(--muted)]">Default for new expenses</p>
          <select
            id="spend-currency"
            value={formData.spendCurrency}
            onChange={(e) => updateFormData({ spendCurrency: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Exchange Rate Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "fixed" })}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.fxMode === "fixed"
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                : "border-[var(--border)] hover:border-[var(--primary)]/50"
            }`}
          >
            <div className="font-semibold text-[var(--foreground)]">Fixed Rate</div>
            <div className="text-xs text-[var(--muted)] mt-1">Lock a specific rate</div>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ fxMode: "live" })}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.fxMode === "live"
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                : "border-[var(--border)] hover:border-[var(--primary)]/50"
            }`}
          >
            <div className="font-semibold text-[var(--foreground)]">Daily Live</div>
            <div className="text-xs text-[var(--muted)] mt-1">Fetch rate each day</div>
          </button>
        </div>
      </div>

      {formData.fxMode === "fixed" && (
        <div className="space-y-2">
          <label htmlFor="fx-rate" className="block text-sm font-medium text-[var(--foreground)]">
            Exchange Rate
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">1 {formData.spendCurrency} =</span>
            <input
              id="fx-rate"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.fixedFxRate}
              onChange={(e) => updateFormData({ fixedFxRate: parseFloat(e.target.value) || 0 })}
              className="w-32 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
            <span className="text-sm text-[var(--muted)]">{formData.baseCurrency}</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            100 {formData.spendCurrency} ≈ {(100 * formData.fixedFxRate).toLocaleString()} {formData.baseCurrency}
          </p>
        </div>
      )}

      <div className="p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
        <div className="flex items-start gap-3">
          <span className="text-lg">💱</span>
          <div className="text-sm text-[var(--foreground)]">
            <span className="font-semibold">Preview:</span> When someone logs an expense of{" "}
            <span className="font-mono">RM 150</span>, it will show as{" "}
            <span className="font-mono">
              ≈ ₹{(150 * formData.fixedFxRate).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
