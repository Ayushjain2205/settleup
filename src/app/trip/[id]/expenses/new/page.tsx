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
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip.members.map((m) => m.id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = useBaseCurrency ? trip.baseCurrency : trip.spendCurrency;
  const amountNum = parseFloat(amount) || 0;
  const convertedAmount = useBaseCurrency ? amountNum : amountNum * trip.fixedFxRate;
  const perPerson = selectedMembers.length > 0 ? convertedAmount / selectedMembers.length : 0;

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-semibold text-[var(--foreground)]">Add Expense</span>
        </div>
      </header>

      <main className="px-4 py-4 space-y-5">
        {/* Amount */}
        <div className="py-3">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <button onClick={() => setUseBaseCurrency(false)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!useBaseCurrency ? "bg-[var(--primary)] text-white" : "bg-[var(--border-color)]/50 text-[var(--muted)]"}`}>
              {trip.spendCurrency}
            </button>
            <button onClick={() => setUseBaseCurrency(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${useBaseCurrency ? "bg-[var(--primary)] text-white" : "bg-[var(--border-color)]/50 text-[var(--muted)]"}`}>
              {trip.baseCurrency}
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl font-light text-[var(--muted)]/30">
              {currency === "INR" ? "₹" : currency === "MYR" ? "RM" : "$"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-center text-4xl font-bold text-[var(--foreground)] bg-transparent border-0 focus:outline-none placeholder:text-[var(--border-color)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          </div>

          {amountNum > 0 && !useBaseCurrency && (
            <p className="text-xs text-[var(--muted)] text-center mt-1">
              ≈ ₹{convertedAmount.toLocaleString()} @ {trip.fixedFxRate}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">What was it for?</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lunch, taxi, tickets..." className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-[var(--border-color)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors" />
        </div>

        {/* Paid By */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Paid by</label>
          <div className="flex flex-wrap gap-1.5">
            {trip.members.map((member) => (
              <button key={member.id} onClick={() => setPaidBy(member.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${paidBy === member.id ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]" : "border-[var(--border-color)] bg-white"}`}>
                <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[9px] font-bold text-[var(--primary)]">{member.avatar}</div>
                <span className="text-xs font-medium text-[var(--foreground)]">{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Split Mode */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Split</label>
          <div className="flex gap-1 p-0.5 bg-[var(--border-color)]/30 rounded-lg">
            {(["equal", "exact", "itemized"] as const).map((mode) => (
              <button key={mode} onClick={() => setSplitMode(mode)} className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold transition-colors ${splitMode === mode ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Split Details */}
        {splitMode === "equal" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Split {selectedMembers.length} ways</span>
              {amountNum > 0 && <span className="text-xs font-semibold text-[var(--foreground)]">₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })} each</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trip.members.map((member) => (
                <button key={member.id} onClick={() => toggleMember(member.id)} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedMembers.includes(member.id) ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border-color)] text-[var(--muted)]"}`}>
                  {member.avatar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Receipt */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[var(--border-color)] rounded-xl text-xs font-medium text-[var(--muted)] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scan Receipt
        </button>
      </main>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-color)] px-4 py-3" style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}>
        <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="w-full py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-40">
          {isSubmitting ? "Adding..." : "Add Expense"}
        </button>
      </div>
    </div>
  );
}
