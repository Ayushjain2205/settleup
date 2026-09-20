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
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-[var(--foreground)]">Group Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Debt Simplification */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-[var(--foreground)]">Simplify Debts</h3>
              <p className="text-sm text-[var(--muted)] mt-1">Minimize the number of payments needed</p>
            </div>
            <button onClick={() => setSimplifyDebts(!simplifyDebts)} className={`relative w-12 h-7 rounded-full transition-all ${simplifyDebts ? "bg-[var(--success)]" : "bg-[var(--border-color)]"}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${simplifyDebts ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[var(--background)]">
            <p className="text-xs text-[var(--muted)]">
              {simplifyDebts ? "ON: Routes payments directly. Fewer transfers, same result." : "OFF: Everyone pays exactly who they owe. More transparent."}
            </p>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border-color)]">
          <h3 className="font-bold text-[var(--foreground)] mb-3">Exchange Rate</h3>
          <div className="flex gap-1 p-1 bg-[var(--background)] rounded-xl mb-4">
            <button onClick={() => setFxMode("fixed")} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${fxMode === "fixed" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}>
              Fixed Rate
            </button>
            <button onClick={() => setFxMode("live")} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${fxMode === "live" ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"}`}>
              Daily Live
            </button>
          </div>
          {fxMode === "fixed" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--muted)]">1 {trip.spendCurrency} =</span>
                {isEditingRate ? (
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.01" value={fixedRate} onChange={(e) => setFixedRate(e.target.value)} className="w-24 px-3 py-2 bg-[var(--background)] border border-[var(--primary)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    <button onClick={() => setIsEditingRate(false)} className="text-sm text-[var(--primary)] font-semibold">Save</button>
                    <button onClick={() => { setFixedRate(trip.fixedFxRate.toString()); setIsEditingRate(false); }} className="text-sm text-[var(--muted)]">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingRate(true)} className="flex items-center gap-1 text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)]">
                    {fixedRate}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">100 {trip.spendCurrency} = {(100 * parseFloat(fixedRate)).toLocaleString()} {trip.baseCurrency}</p>
            </div>
          )}
        </div>

        {/* Invite */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border-color)]">
          <h3 className="font-bold text-[var(--foreground)] mb-3">Invite Members</h3>
          <div className="flex items-center gap-2 mb-4">
            <input type="text" readOnly value={inviteLink} className="flex-1 px-3 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--muted)]" />
            <button onClick={handleCopyLink} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? "bg-[var(--success)] text-white" : "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"}`}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--border-color)]">
          <h3 className="font-bold text-[var(--foreground)] mb-4">Members</h3>
          <div className="space-y-3">
            {trip.members.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">{member.avatar}</div>
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">{member.name}{index === 0 && <span className="ml-2 text-xs text-[var(--muted)]">(You)</span>}</div>
                    {member.upiId && <div className="text-xs text-[var(--muted)]">{member.upiId}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-5 rounded-2xl bg-[var(--error)]/[0.04] border border-[var(--error)]/20">
          <h3 className="font-bold text-[var(--error)] mb-2">Danger Zone</h3>
          <p className="text-sm text-[var(--muted)] mb-4">These actions cannot be undone.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm font-semibold hover:bg-[var(--foreground)]/[0.03] transition-all">Leave Group</button>
            <button className="px-4 py-2 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl text-sm font-semibold text-[var(--error)] hover:bg-[var(--error)]/20 transition-all">Delete Group</button>
          </div>
        </div>
      </main>
    </div>
  );
}
