"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MOCK_TRIP } from "@/lib/mock-data";
import { PayerPicker } from "@/components/payer-picker";
import { SplitOptions } from "@/components/split-options";

type SplitMode = "equal" | "exact" | "percent" | "itemized";

const getSymbol = (currency: string) => currency === "INR" ? "₹" : currency === "MYR" ? "RM" : "$";

export default function AddExpensePage() {
  const router = useRouter();
  const trip = MOCK_TRIP;
  const dateRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(trip.members[0].id);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip.members.map((m) => m.id));
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [useBaseCurrency, setUseBaseCurrency] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const currency = useBaseCurrency ? trip.baseCurrency : trip.spendCurrency;
  const symbol = getSymbol(currency);

  const isToday = expenseDate === new Date().toISOString().split("T")[0];
  const dateLabel = isToday ? "Today" : new Date(expenseDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const paidByName = trip.members.find((m) => m.id === paidBy)?.name || "you";
  const splitLabel = splitMode === "equal" ? "equally" : splitMode === "exact" ? "by amount" : splitMode === "percent" ? "by %" : "by items";

  const canSubmit = amountNum > 0 && title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push(`/trip/${trip.id}`);
  };

  const handlePayerSelect = (id: string) => {
    setPaidBy(id);
  };

  const handleSplitConfirm = (mode: SplitMode, selected: string[], exact: Record<string, string>, pcts: Record<string, string>) => {
    setSplitMode(mode);
    setSelectedMembers(selected);
    setExactAmounts(exact);
    setPercentages(pcts);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="flex-1 text-center text-[15px] font-semibold text-[var(--foreground)]">Add an expense</span>
          <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="text-sm font-bold text-[var(--primary)] disabled:opacity-40">
            Save
          </button>
        </div>
      </header>

      {/* Who */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-[var(--muted)]">With you and:</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--border-color)]/30 rounded-full">
            <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[8px] font-bold text-[var(--primary)]">
              {trip.members.length}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">{trip.name}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 flex flex-col px-4 pt-6 pb-4">
        {/* Description */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a description"
            className="flex-1 text-[15px] text-[var(--foreground)] bg-transparent border-0 border-b-2 border-[var(--primary)] focus:outline-none pb-2 placeholder:text-[var(--muted)]/40 transition-colors"
            autoFocus
          />
        </div>

        {/* Amount */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setUseBaseCurrency((p) => !p)}
            className="w-10 h-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 active:bg-[var(--background)] transition-colors"
          >
            <span className="text-lg font-semibold text-[var(--muted)]">{symbol}</span>
          </button>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 text-xl font-bold text-[var(--foreground)] bg-transparent border-0 border-b-2 border-[var(--primary)] focus:outline-none pb-2 placeholder:text-[var(--border-color)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Paid by + Split */}
        <div className="flex items-center justify-center gap-2 text-[15px]">
          <span className="text-[var(--muted)]">Paid by</span>
          <button
            onClick={() => setShowPayerPicker(true)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)] active:bg-[var(--background)] transition-colors"
          >
            {paidByName}
          </button>
          <span className="text-[var(--muted)]">and split</span>
          <button
            onClick={() => setShowSplitOptions(true)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)] active:bg-[var(--background)] transition-colors"
          >
            {splitLabel}
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <button onClick={() => dateRef.current?.showPicker()} className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="font-medium">{dateLabel}</span>
          </button>
          <input
            ref={dateRef}
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="sr-only"
          />
          <button className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="font-medium">{trip.name}</span>
          </button>
          <button className="p-2 text-[var(--primary)]" title="Scan receipt">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button className="p-2 text-[var(--primary)]" title="Add note">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        </div>
      </main>

      {/* Bottom sheets */}
      {showPayerPicker && (
        <PayerPicker
          members={trip.members}
          selected={paidBy}
          onSelect={handlePayerSelect}
          onClose={() => setShowPayerPicker(false)}
        />
      )}
      {showSplitOptions && (
        <SplitOptions
          amount={amountNum}
          symbol={symbol}
          members={trip.members}
          initialMode={splitMode}
          initialSelected={selectedMembers}
          initialExactAmounts={exactAmounts}
          initialPercentages={percentages}
          onClose={() => setShowSplitOptions(false)}
          onConfirm={handleSplitConfirm}
        />
      )}
    </div>
  );
}
