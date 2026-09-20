"use client";

import { useState, useRef, useEffect } from "react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", flag: "🇳🇵" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
];

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}

export function CurrencyPicker({ value, onChange, label }: CurrencyPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = CURRENCIES.find((c) => c.code === value);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-0 py-2.5 bg-transparent border-0 border-b border-[var(--border-color)] text-left transition-colors hover:border-[var(--primary)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{selected?.flag}</span>
          <div>
            <div className="text-base font-semibold text-[var(--foreground)]">{selected?.code}</div>
            <div className="text-[10px] text-[var(--muted)]">{selected?.name}</div>
          </div>
        </div>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "var(--safe-bottom)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-[var(--foreground)]">{label || "Currency"}</h3>
                <button onClick={() => setOpen(false)} className="text-xs font-medium text-[var(--primary)]">
                  Done
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currencies..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* Currency list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted)]">No currencies found</div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {filtered.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        onChange(currency.code);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 py-3 active:bg-[var(--background)] transition-colors"
                    >
                      <span className="text-xl w-8 text-center">{currency.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-[var(--foreground)]">{currency.code}</div>
                        <div className="text-[11px] text-[var(--muted)]">{currency.name}</div>
                      </div>
                      <span className="text-sm text-[var(--muted)]">{currency.symbol}</span>
                      {value === currency.code && (
                        <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
