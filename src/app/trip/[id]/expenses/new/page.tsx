"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_TRIP } from "@/lib/mock-data";

type SplitMode = "equal" | "exact" | "itemized";

export default function AddExpensePage() {
  const router = useRouter();
  const trip = MOCK_TRIP;

  const [amount, setAmount] = useState("");
  const [useBaseCurrency, setUseBaseCurrency] = useState(false);
  const [title, setTitle] = useState("");
  const [paidBy, setPaidBy] = useState(trip.members[0].id);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    trip.members.map((m) => m.id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = useBaseCurrency ? trip.baseCurrency : trip.spendCurrency;
  const amountNum = parseFloat(amount) || 0;
  const convertedAmount = useBaseCurrency
    ? amountNum
    : amountNum * trip.fixedFxRate;
  const perPerson =
    selectedMembers.length > 0 ? convertedAmount / selectedMembers.length : 0;

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const canSubmit = amountNum > 0 && title.trim().length > 0 && selectedMembers.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push(`/trip/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold text-[var(--foreground)]">Add Expense</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Amount */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={() => setUseBaseCurrency(false)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                !useBaseCurrency
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
              }`}
            >
              {trip.spendCurrency}
            </button>
            <button
              onClick={() => setUseBaseCurrency(true)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                useBaseCurrency
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
              }`}
            >
              {trip.baseCurrency}
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-[var(--muted)]">
              {currency === "INR" ? "₹" : currency === "MYR" ? "RM" : "$"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-center text-5xl font-bold text-[var(--foreground)] bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[var(--border)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          </div>

          {amountNum > 0 && !useBaseCurrency && (
            <p className="text-sm text-[var(--muted)] mt-2">
              ≈ ₹{convertedAmount.toLocaleString()} @ {trip.fixedFxRate}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            What was it for?
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lunch, taxi, tickets..."
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Paid By */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Paid by
          </label>
          <div className="flex flex-wrap gap-2">
            {trip.members.map((member) => (
              <button
                key={member.id}
                onClick={() => setPaidBy(member.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  paidBy === member.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
                  {member.avatar}
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {member.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Split Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Split
          </label>
          <div className="flex gap-1 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            {(["equal", "exact", "itemized"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSplitMode(mode)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  splitMode === mode
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Split Details */}
        {splitMode === "equal" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">
                Split {selectedMembers.length} ways
              </span>
              {amountNum > 0 && (
                <span className="text-sm font-medium text-[var(--foreground)]">
                  ₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })} each
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    selectedMembers.includes(member.id)
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {member.avatar}
                </button>
              ))}
            </div>
          </div>
        )}

        {splitMode === "exact" && (
          <div className="space-y-2">
            {trip.members
              .filter((m) => selectedMembers.includes(m.id))
              .map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
                    {member.avatar}
                  </div>
                  <span className="flex-1 text-sm text-[var(--foreground)]">
                    {member.name}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-24 px-3 py-2 text-right bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>
              ))}
          </div>
        )}

        {splitMode === "itemized" && (
          <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <span className="text-lg">📝</span>
              <div>
                <div className="font-medium text-[var(--foreground)]">Itemized Split</div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  Add items and assign them to members. Coming soon!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Scan */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scan Receipt
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--primary-dark)] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </span>
          ) : (
            "Add Expense"
          )}
        </button>
      </main>
    </div>
  );
}
