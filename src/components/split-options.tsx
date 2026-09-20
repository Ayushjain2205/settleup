"use client";

import { useState } from "react";

type SplitMode = "equal" | "exact" | "percent" | "itemized";

interface SplitOptionsProps {
  amount: number;
  symbol: string;
  members: { id: string; name: string; avatar: string }[];
  initialMode: SplitMode;
  initialSelected: string[];
  initialExactAmounts: Record<string, string>;
  initialPercentages: Record<string, string>;
  onClose: () => void;
  onConfirm: (mode: SplitMode, selected: string[], exactAmounts: Record<string, string>, percentages: Record<string, string>) => void;
}

const MODES: { key: SplitMode; icon: string; label: string }[] = [
  { key: "equal", icon: "=", label: "Equal" },
  { key: "exact", icon: "1.23", label: "Exact" },
  { key: "percent", icon: "%", label: "Percent" },
  { key: "itemized", icon: "≡", label: "Itemized" },
];

const MODE_SUBTITLES: Record<SplitMode, string> = {
  equal: "Select which people owe an equal share.",
  exact: "Enter the exact amount each person owes.",
  percent: "Enter the percentage each person owes.",
  itemized: "Add items and split each among selected people.",
};

export function SplitOptions({
  amount,
  symbol,
  members,
  initialMode,
  initialSelected,
  initialExactAmounts,
  initialPercentages,
  onClose,
  onConfirm,
}: SplitOptionsProps) {
  const [mode, setMode] = useState<SplitMode>(initialMode);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(initialExactAmounts);
  const [percentages, setPercentages] = useState<Record<string, string>>(initialPercentages);
  const [items, setItems] = useState<{ name: string; amount: string; splitAmong: string[] }[]>([
    { name: "", amount: "", splitAmong: members.map((m) => m.id) },
  ]);

  const perPerson = selected.length > 0 ? amount / selected.length : 0;

  const toggleMember = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected((prev) => prev.length === members.length ? [] : members.map((m) => m.id));
  };

  const totalExact = Object.values(exactAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const exactRemaining = amount - totalExact;

  const totalPercent = Object.values(percentages).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const percentRemaining = 100 - totalPercent;

  const handleConfirm = () => {
    onConfirm(mode, selected, exactAmounts, percentages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
          <button onClick={onClose} className="text-sm font-semibold text-[var(--primary)]">
            Cancel
          </button>
          <span className="text-base font-semibold text-[var(--foreground)]">Split options</span>
          <button onClick={handleConfirm} className="text-sm font-semibold text-[var(--primary)]">
            Done
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex px-4 gap-2 py-3 border-b border-[var(--border-color)]">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === m.key
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--border-color)]/40 text-[var(--muted)]"
              }`}
            >
              {m.icon}
            </button>
          ))}
        </div>

        {/* Mode title + subtitle */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-base font-semibold text-[var(--foreground)]">Split {mode}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{MODE_SUBTITLES[mode]}</div>
        </div>

        {/* Member list */}
        <div className="overflow-y-auto flex-1 px-4">
          {mode === "equal" && members.map((member) => (
            <button
              key={member.id}
              onClick={() => toggleMember(member.id)}
              className="w-full flex items-center gap-3 py-3 border-b border-[var(--border-color)]/50"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                {member.avatar}
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                selected.includes(member.id) ? "bg-[var(--primary)]" : "border-2 border-[var(--border-color)]"
              }`}>
                {selected.includes(member.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}

          {mode === "exact" && members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3 border-b border-[var(--border-color)]/50">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                {member.avatar}
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-[var(--muted)]">{symbol}</span>
                <input
                  type="number"
                  value={exactAmounts[member.id] || ""}
                  onChange={(e) => setExactAmounts((prev) => ({ ...prev, [member.id]: e.target.value }))}
                  placeholder="0"
                  className="w-24 text-right text-[15px] font-semibold text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border-color)] focus:border-[var(--primary)] focus:outline-none pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          ))}

          {mode === "percent" && members.map((member) => {
            const pct = parseFloat(percentages[member.id]) || 0;
            const memberAmount = amount * (pct / 100);
            return (
              <div key={member.id} className="flex items-center gap-3 py-3 border-b border-[var(--border-color)]/50">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                  {member.avatar}
                </div>
                <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
                <div className="flex items-center gap-2">
                  {pct > 0 && (
                    <span className="text-xs text-[var(--muted)]">{symbol}{memberAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={percentages[member.id] || ""}
                      onChange={(e) => setPercentages((prev) => ({ ...prev, [member.id]: e.target.value }))}
                      placeholder="0"
                      className="w-16 text-right text-[15px] font-semibold text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border-color)] focus:border-[var(--primary)] focus:outline-none pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-[var(--muted)]">%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {mode === "itemized" && (
            <>
              {items.map((item, idx) => (
                <div key={idx} className="py-3 border-b border-[var(--border-color)]/50 space-y-2">
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
                      className="flex-1 text-[15px] font-medium text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border-color)] focus:border-[var(--primary)] focus:outline-none pb-1 placeholder:text-[var(--muted)]/40 transition-colors"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[var(--muted)]">{symbol}</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].amount = e.target.value;
                          setItems(newItems);
                        }}
                        placeholder="0"
                        className="w-24 text-right text-[15px] font-semibold text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border-color)] focus:border-[var(--primary)] focus:outline-none pb-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((member) => (
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
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                          item.splitAmong.includes(member.id) ? "bg-[var(--primary)] text-white" : "bg-[var(--border-color)]/50 text-[var(--muted)]"
                        }`}
                      >
                        {member.avatar}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setItems([...items, { name: "", amount: "", splitAmong: members.map((m) => m.id) }])}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[var(--primary)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add item
              </button>
            </>
          )}
        </div>

        {/* Bottom summary */}
        <div className="px-4 py-4 border-t border-[var(--border-color)] flex items-center justify-between" style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}>
          <div>
            {mode === "equal" && amount > 0 && selected.length > 0 && (
              <>
                <div className="text-base font-bold text-[var(--foreground)]">{symbol}{perPerson.toLocaleString(undefined, { maximumFractionDigits: 2 })}/person</div>
                <div className="text-xs text-[var(--muted)]">({selected.length} people)</div>
              </>
            )}
            {mode === "exact" && (
              <>
                <div className={`text-sm font-semibold ${Math.abs(exactRemaining) < 0.01 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                  {Math.abs(exactRemaining) < 0.01 ? "Balanced" : `${symbol}${Math.abs(exactRemaining).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${exactRemaining > 0 ? "left" : "over"}`}
                </div>
              </>
            )}
            {mode === "percent" && (
              <>
                <div className={`text-sm font-semibold ${Math.abs(percentRemaining) < 0.01 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                  {Math.abs(percentRemaining) < 0.01 ? "100%" : `${percentRemaining.toFixed(1)}% left`}
                </div>
              </>
            )}
          </div>
          {mode === "equal" && (
            <button onClick={toggleAll} className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--foreground)]">All</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                selected.length === members.length ? "bg-[var(--primary)]" : "border-2 border-[var(--border-color)]"
              }`}>
                {selected.length === members.length && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
