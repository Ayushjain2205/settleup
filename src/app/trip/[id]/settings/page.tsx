"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_TRIP } from "@/lib/mock-data";

export default function SettingsPage() {
  const router = useRouter();
  const trip = MOCK_TRIP;

  const [simplifyDebts, setSimplifyDebts] = useState(trip.simplifyDebts);
  const [fxMode, setFxMode] = useState(trip.fxMode);
  const [fixedRate, setFixedRate] = useState(trip.fixedFxRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://settleup.app/join/${trip.id}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">Settings</span>
        </div>
      </header>

      <main className="pb-24">
        {/* Debt Simplification */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">Simplify Debts</div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">Minimize payments needed</div>
            </div>
            <button onClick={() => setSimplifyDebts(!simplifyDebts)} className={`relative w-11 h-6 rounded-full transition-colors ${simplifyDebts ? "bg-[var(--success)]" : "bg-[var(--border-color)]"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${simplifyDebts ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">Exchange Rate</div>
          <div className="flex gap-1 p-0.5 bg-[var(--border-color)]/30 rounded-lg mb-3">
            <button onClick={() => setFxMode("fixed")} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${fxMode === "fixed" ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Fixed
            </button>
            <button onClick={() => setFxMode("live")} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${fxMode === "live" ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Live
            </button>
          </div>
          {fxMode === "fixed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">1 {trip.spendCurrency} =</span>
              {isEditingRate ? (
                <div className="flex items-center gap-1.5">
                  <input type="number" step="0.01" value={fixedRate} onChange={(e) => setFixedRate(e.target.value)} className="w-20 px-2 py-1 bg-[var(--background)] border border-[var(--primary)] rounded-md text-xs focus:outline-none" />
                  <button onClick={() => setIsEditingRate(false)} className="text-[10px] text-[var(--primary)] font-semibold">Save</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingRate(true)} className="text-xs font-semibold text-[var(--foreground)]">
                  {fixedRate} {trip.baseCurrency}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Invite */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">Invite Members</div>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={inviteLink} className="flex-1 px-2 py-1.5 bg-[var(--background)] border border-[var(--border-color)] rounded-md text-[10px] text-[var(--muted)] truncate" />
            <button onClick={handleCopyLink} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${copied ? "bg-[var(--success)] text-white" : "bg-[var(--primary)] text-white"}`}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">Members</div>
          <div className="divide-y divide-[var(--border-color)]">
            {trip.members.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{member.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground)] truncate">
                    {member.name}{index === 0 && <span className="ml-1 text-[10px] text-[var(--muted)]">(You)</span>}
                  </div>
                  {member.upiId && <div className="text-[10px] text-[var(--muted)] truncate">{member.upiId}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-4 py-3">
          <div className="text-[10px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2">Danger Zone</div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-white border border-[var(--border-color)] rounded-lg text-xs font-medium text-[var(--muted)]">Leave</button>
            <button className="flex-1 py-2 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-lg text-xs font-medium text-[var(--error)]">Delete</button>
          </div>
        </div>
      </main>
    </div>
  );
}
