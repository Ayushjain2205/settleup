"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_TRIP } from "@/lib/mock-data";

type SplitMode = "equal" | "exact" | "percent" | "itemized";

export default function AddExpensePage() {
  const router = useRouter();
  const trip = MOCK_TRIP;

  const [amount, setAmount] = useState("");
  const [useBaseCurrency, setUseBaseCurrency] = useState(false);
  const [title, setTitle] = useState("");
  const [paidBy, setPaidBy] = useState(trip.members[0].id);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(trip.members.map((m) => m.id));
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [items, setItems] = useState<{ name: string; amount: string; splitAmong: string[] }[]>([
    { name: "", amount: "", splitAmong: trip.members.map((m) => m.id) },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = useBaseCurrency ? trip.baseCurrency : trip.spendCurrency;
  const amountNum = parseFloat(amount) || 0;
  const convertedAmount = useBaseCurrency ? amountNum : amountNum * trip.fixedFxRate;
  const perPerson = selectedMembers.length > 0 ? convertedAmount / selectedMembers.length : 0;

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  // Calculate exact split totals
  const totalExact = Object.values(exactAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const exactRemaining = convertedAmount - totalExact;

  // Calculate percent split
  const totalPercent = Object.values(percentages).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const percentRemaining = 100 - totalPercent;

  // Itemized split
  const totalItemized = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const itemizedRemaining = convertedAmount - totalItemized;

  const canSubmit = amountNum > 0 && title.trim().length > 0 && selectedMembers.length > 0 && (
    splitMode === "equal" ||
    (splitMode === "exact" && Math.abs(exactRemaining) < 0.01) ||
    (splitMode === "percent" && Math.abs(percentRemaining) < 0.01 && totalPercent === 100) ||
    (splitMode === "itemized" && Math.abs(itemizedRemaining) < 0.01 && items.every((item) => item.name.trim().length > 0))
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    router.push(`/trip/${trip.id}`);
  };

  const getSymbol = () => currency === "INR" ? "₹" : currency === "MYR" ? "RM" : "$";

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
        {/* Scan Receipt — primary action */}
        <button className="w-full flex flex-col items-center gap-2 py-6 bg-[var(--primary)]/[0.04] border-2 border-dashed border-[var(--primary)]/30 rounded-xl active:bg-[var(--primary)]/[0.08] transition-colors">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--primary)]">Scan receipt</div>
            <div className="text-[11px] text-[var(--muted)]">AI extracts items and amounts</div>
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border-color)]" />
          <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">or enter manually</span>
          <div className="flex-1 h-px bg-[var(--border-color)]" />
        </div>

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
              {getSymbol()}
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
            {(["equal", "exact", "percent", "itemized"] as const).map((mode) => (
              <button key={mode} onClick={() => setSplitMode(mode)} className={`flex-1 py-2 px-1.5 rounded-md text-[11px] font-semibold transition-colors ${splitMode === mode ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                {mode === "equal" ? "Equal" : mode === "exact" ? "Exact" : mode === "percent" ? "%" : "Items"}
              </button>
            ))}
          </div>
        </div>

        {/* Equal Split */}
        {splitMode === "equal" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Split {selectedMembers.length} ways</span>
              {amountNum > 0 && <span className="text-xs font-semibold text-[var(--foreground)]">{getSymbol()}{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })} each</span>}
            </div>
            <div className="bg-white border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
              {trip.members.map((member) => (
                <button key={member.id} onClick={() => toggleMember(member.id)} className="w-full flex items-center gap-3 px-3 py-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${selectedMembers.includes(member.id) ? "bg-[var(--primary)] text-white" : "bg-[var(--border-color)]/50 text-[var(--muted)]"}`}>
                    {member.avatar}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-[var(--foreground)]">{member.name}</span>
                  {selectedMembers.includes(member.id) && amountNum > 0 && (
                    <span className="text-xs font-semibold text-[var(--foreground)]">{getSymbol()}{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMembers.includes(member.id) ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border-color)]"}`}>
                    {selectedMembers.includes(member.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exact Split */}
        {splitMode === "exact" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Enter amounts</span>
              <span className={`text-xs font-semibold ${Math.abs(exactRemaining) < 0.01 ? "text-[var(--success)]" : exactRemaining > 0 ? "text-[var(--accent)]" : "text-[var(--error)]"}`}>
                {exactRemaining > 0.01 ? `${getSymbol()}${exactRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left` : exactRemaining < -0.01 ? `${getSymbol()}${Math.abs(exactRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })} over` : "Balanced"}
              </span>
            </div>
            <div className="bg-white border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
              {trip.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">
                    {member.avatar}
                  </div>
                  <span className="flex-1 text-sm font-medium text-[var(--foreground)]">{member.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[var(--muted)]">{getSymbol()}</span>
                    <input
                      type="number"
                      value={exactAmounts[member.id] || ""}
                      onChange={(e) => setExactAmounts((prev) => ({ ...prev, [member.id]: e.target.value }))}
                      placeholder="0"
                      className="w-20 text-right text-sm font-semibold text-[var(--foreground)] bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Percent Split */}
        {splitMode === "percent" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Enter percentages</span>
              <span className={`text-xs font-semibold ${Math.abs(percentRemaining) < 0.01 ? "text-[var(--success)]" : percentRemaining > 0 ? "text-[var(--accent)]" : "text-[var(--error)]"}`}>
                {percentRemaining > 0.01 ? `${percentRemaining.toFixed(1)}% left` : percentRemaining < -0.01 ? `${Math.abs(percentRemaining).toFixed(1)}% over` : "100%"}
              </span>
            </div>
            <div className="bg-white border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
              {trip.members.map((member) => {
                const pct = parseFloat(percentages[member.id]) || 0;
                const memberAmount = convertedAmount * (pct / 100);
                return (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[var(--foreground)]">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pct > 0 && (
                        <span className="text-[10px] text-[var(--muted)]">{getSymbol()}{memberAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={percentages[member.id] || ""}
                          onChange={(e) => setPercentages((prev) => ({ ...prev, [member.id]: e.target.value }))}
                          placeholder="0"
                          className="w-14 text-right text-sm font-semibold text-[var(--foreground)] bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-[var(--muted)]">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Itemized Split */}
        {splitMode === "itemized" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Add items from the receipt</span>
              <span className={`text-xs font-semibold ${Math.abs(itemizedRemaining) < 0.01 ? "text-[var(--success)]" : itemizedRemaining > 0 ? "text-[var(--accent)]" : "text-[var(--error)]"}`}>
                {itemizedRemaining > 0.01 ? `${getSymbol()}${itemizedRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left` : itemizedRemaining < -0.01 ? `${getSymbol()}${Math.abs(itemizedRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })} over` : "Balanced"}
              </span>
            </div>

            <div className="bg-white border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)]">
              {items.map((item, idx) => (
                <div key={idx} className="px-3 py-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].name = e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="Item name"
                      className="flex-1 text-sm font-medium text-[var(--foreground)] bg-transparent border-0 focus:outline-none placeholder:text-[var(--muted)]/40"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--muted)]">{getSymbol()}</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].amount = e.target.value;
                          setItems(newItems);
                        }}
                        placeholder="0"
                        className="w-20 text-right text-sm font-semibold text-[var(--foreground)] bg-transparent border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    {items.length > 1 && (
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-1">
                        <svg className="w-4 h-4 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Split among toggles */}
                  <div className="flex flex-wrap gap-1">
                    {trip.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          const newItems = [...items];
                          if (newItems[idx].splitAmong.includes(member.id)) {
                            newItems[idx].splitAmong = newItems[idx].splitAmong.filter((id) => id !== member.id);
                          } else {
                            newItems[idx].splitAmong = [...newItems[idx].splitAmong, member.id];
                          }
                          setItems(newItems);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors ${item.splitAmong.includes(member.id) ? "bg-[var(--primary)] text-white" : "bg-[var(--border-color)]/50 text-[var(--muted)]"}`}
                      >
                        {member.avatar}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setItems([...items, { name: "", amount: "", splitAmong: trip.members.map((m) => m.id) }])}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--primary)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          </div>
        )}
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
