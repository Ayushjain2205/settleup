"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SettingsFormProps {
  group: {
    id: string;
    baseCurrency: string;
    spendCurrency: string;
    simplifyDebts: boolean;
    fxMode: string;
    fixedFxRate: number;
    createdBy: string | null;
  };
  members: { id: string; name: string; avatar: string; userId: string | null }[];
  currentUserId: string;
}

export function SettingsForm({ group, members, currentUserId }: SettingsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [simplifyDebts, setSimplifyDebts] = useState(group.simplifyDebts);
  const [fxMode, setFxMode] = useState(group.fxMode);
  const [fixedRate, setFixedRate] = useState(group.fixedFxRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = group.createdBy === currentUserId;

  const updateGroup = async (patch: Record<string, unknown>, revert: () => void) => {
    setError(null);
    const { error } = await supabase.from("groups").update(patch).eq("id", group.id);
    if (error) {
      revert();
      setError(error.message);
    }
  };

  const toggleSimplify = () => {
    const next = !simplifyDebts;
    setSimplifyDebts(next);
    updateGroup({ simplify_debts: next }, () => setSimplifyDebts(!next));
  };

  const changeFxMode = (mode: string) => {
    const prev = fxMode;
    setFxMode(mode);
    updateGroup({ fx_mode: mode }, () => setFxMode(prev));
  };

  const saveRate = () => {
    const rate = parseFloat(fixedRate);
    if (!rate || rate <= 0) {
      setFixedRate(group.fixedFxRate.toString());
      setIsEditingRate(false);
      return;
    }
    setIsEditingRate(false);
    updateGroup({ fixed_fx_rate: rate }, () => setFixedRate(group.fixedFxRate.toString()));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete this group and all its expenses? This can't be undone.`)) return;
    setIsDeleting(true);
    const { error } = await supabase.from("groups").delete().eq("id", group.id);
    if (error) {
      setError(error.message);
      setIsDeleting(false);
      return;
    }
    router.push("/");
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
        {error && (
          <p className="mx-4 mt-4 text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5">{error}</p>
        )}

        {/* Debt Simplification */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">Simplify Debts</div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">Minimize payments needed</div>
            </div>
            <button onClick={toggleSimplify} className={`relative w-11 h-6 rounded-full transition-colors ${simplifyDebts ? "bg-[var(--success)]" : "bg-[var(--border-color)]"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${simplifyDebts ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">Exchange Rate</div>
          <div className="flex gap-1 p-0.5 bg-[var(--border-color)]/30 rounded-lg mb-3">
            <button onClick={() => changeFxMode("fixed")} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${fxMode === "fixed" ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Fixed
            </button>
            <button onClick={() => changeFxMode("live")} className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${fxMode === "live" ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
              Live
            </button>
          </div>
          {fxMode === "fixed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">1 {group.spendCurrency} =</span>
              {isEditingRate ? (
                <div className="flex items-center gap-1.5">
                  <input type="number" step="0.01" value={fixedRate} onChange={(e) => setFixedRate(e.target.value)} className="w-20 px-2 py-1 bg-[var(--background)] border border-[var(--primary)] rounded-md text-xs focus:outline-none" />
                  <button onClick={saveRate} className="text-[10px] text-[var(--primary)] font-semibold">Save</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingRate(true)} className="text-xs font-semibold text-[var(--foreground)]">
                  {fixedRate} {group.baseCurrency}
                </button>
              )}
            </div>
          )}
          {fxMode === "live" && (
            <p className="text-[11px] text-[var(--muted)]">Live rates aren&apos;t connected yet — expenses use a 1:1 rate for now.</p>
          )}
        </div>

        {/* Members */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="text-sm font-medium text-[var(--foreground)] mb-2">Members</div>
          <div className="divide-y divide-[var(--border-color)]">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{member.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground)] truncate">
                    {member.name}{member.userId === currentUserId && <span className="ml-1 text-[10px] text-[var(--muted)]">(You)</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone — creator only */}
        {isCreator && (
          <div className="px-4 py-3">
            <div className="text-[10px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2">Danger Zone</div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-2 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-lg text-xs font-medium text-[var(--error)] disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete group"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
