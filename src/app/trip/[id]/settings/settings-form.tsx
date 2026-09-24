"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/error";
import { avatarColor, avatarInitial } from "@/lib/avatar";
import { success } from "@/lib/haptics";
import { toast } from "@/components/toast";
import { useMemberRows, useSession, useTripMeta } from "@/lib/queries";
import { useAddMember, useDeleteGroup, useUpdateGroup } from "@/lib/mutations";

function SettingsSkeleton() {
  return (
    <div className="min-h-dvh bg-[var(--background)] animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <div className="w-5 h-5 rounded bg-[var(--border-color)] mr-3" />
          <div className="h-5 w-24 rounded bg-[var(--border-color)]" />
        </div>
      </header>
      <main>
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="h-4 w-32 rounded bg-[var(--border-color)]" />
        </div>
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="h-4 w-28 rounded bg-[var(--border-color)] mb-2" />
          <div className="h-8 rounded-lg bg-[var(--border-color)]" />
        </div>
      </main>
    </div>
  );
}

export function SettingsForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: session, isLoading: sessionLoading } = useSession();
  const ready = !sessionLoading && !!session;
  const { data: meta, isLoading: metaLoading } = useTripMeta(groupId, ready);
  const { data: memberRows } = useMemberRows(groupId, ready);
  const members = memberRows || [];

  const updateGroup = useUpdateGroup(groupId);
  const deleteGroup = useDeleteGroup();
  const addMember = useAddMember(groupId);

  const [simplifyDebts, setSimplifyDebts] = useState<boolean | null>(null);
  const [fixedRate, setFixedRate] = useState("");
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pending, setPending] = useState<{ id: string; name: string; avatar: string; userId: null; email: string | null }[]>([]);

  // Seed + re-sync local toggles from cache
  useEffect(() => {
    if (meta) {
      setSimplifyDebts(meta.simplifyDebts);
      setFixedRate(String(meta.fxRate));
    }
  }, [meta]);
  useEffect(() => {
    setPending([]);
  }, [memberRows]);

  useEffect(() => {
    if (!sessionLoading && !session) router.replace("/login");
  }, [sessionLoading, session, router]);

  if (sessionLoading || !session || !meta || simplifyDebts === null) {
    return <SettingsSkeleton />;
  }

  const allMembers = [...members, ...pending];
  const isCreator = meta.createdBy === session.user.id;

  const patch = (p: Record<string, unknown>, revert: () => void) => {
    setError(null);
    updateGroup.mutate(p, {
      onError: (err) => {
        revert();
        setError(errorMessage(err, "Could not save setting"));
      },
    });
  };

  const toggleSimplify = () => {
    const next = !simplifyDebts;
    setSimplifyDebts(next);
    patch({ simplify_debts: next }, () => setSimplifyDebts(!next));
  };

  const saveRate = async () => {
    const rate = parseFloat(fixedRate);
    if (!rate || rate <= 0) {
      setFixedRate(String(meta.fxRate));
      setIsEditingRate(false);
      return;
    }
    setIsEditingRate(false);
    setError(null);
    const { error } = await supabase.rpc("revalue_group", { p_group_id: groupId, p_rate: rate });
    if (error) {
      setFixedRate(String(meta.fxRate));
      setError(errorMessage(error, "Could not update rate"));
      return;
    }
    success();
    toast("Rate updated — history revalued");
    queryClient.invalidateQueries({ queryKey: ["trip", groupId] });
    queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
    queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(meta.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete this group and all its expenses? This can't be undone.`)) return;
    setIsDeleting(true);
    deleteGroup.mutate(groupId, {
      onSuccess: () => router.push("/"),
      onError: (err) => {
        setError(errorMessage(err, "Could not delete group"));
        setIsDeleting(false);
      },
    });
  };

  const handleAddMember = () => {
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    if (name.length < 1 || isAdding) return;
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email or leave it blank");
      return;
    }
    setIsAdding(true);
    setError(null);
    const tempId = `temp-${Date.now()}`;
    setPending((prev) => [...prev, { id: tempId, name, avatar: name[0]?.toUpperCase() || "?", userId: null, email: email || null }]);
    setNewName("");
    setNewEmail("");
    setShowAddMember(false);
    success();
    addMember.mutate(
      { name, avatar: name[0]?.toUpperCase() || "?", email: email || null },
      {
        onSuccess: () => toast("Member added"),
        onError: (err) => {
          setPending((prev) => prev.filter((m) => m.id !== tempId));
          setError(errorMessage(err, "Could not add member"));
        },
        onSettled: () => setIsAdding(false),
      }
    );
  };

  return (
    <div className="min-h-dvh bg-[var(--background)]">
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
          <div className="text-sm font-medium text-[var(--foreground)] mb-1">Exchange Rate</div>
          <p className="text-[11px] text-[var(--muted)] mb-2">Changing it revalues every {meta.spendCurrency} expense in this group</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">1 {meta.spendCurrency} =</span>
            {isEditingRate ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={fixedRate}
                  onChange={(e) => setFixedRate(e.target.value)}
                  autoFocus
                  className="w-20 px-2 py-1 bg-[var(--background)] border border-[var(--primary)] rounded-md text-xs focus:outline-none"
                />
                <span className="text-xs text-[var(--muted)]">{meta.baseCurrency}</span>
                <div className="flex-1" />
                <button onClick={() => { setFixedRate(String(meta.fxRate)); setIsEditingRate(false); }} className="text-[10px] text-[var(--muted)] font-semibold px-2 py-1">
                  Cancel
                </button>
                <button onClick={saveRate} className="text-[10px] text-white font-semibold px-3 py-1.5 bg-[var(--primary)] rounded-md">
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditingRate(true)} className="text-xs font-semibold text-[var(--foreground)]">
                {fixedRate} {meta.baseCurrency}
              </button>
            )}
          </div>
        </div>

        {/* Group code */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">Group code</div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">Share it so friends can join</div>
            </div>
            <button onClick={handleCopyCode} className="px-3 py-2 rounded-lg bg-[var(--primary)]/10 active:bg-[var(--primary)]/20 transition-colors">
              <span className="text-sm font-bold tracking-[0.2em] text-[var(--primary)] tabular-nums">
                {copiedCode ? "Copied!" : meta.joinCode}
              </span>
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-[var(--foreground)]">Members</div>
            <button onClick={() => setShowAddMember(true)} className="text-xs font-semibold text-[var(--primary)]">
              + Add
            </button>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {allMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColor(member.id).bg, color: avatarColor(member.id).fg }}
                >
                  {avatarInitial(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground)] truncate">
                    {member.name}{member.userId === session?.user.id && <span className="ml-1 text-[10px] text-[var(--muted)]">(You)</span>}
                  </div>
                  {member.userId === null && member.email && (
                    <div className="text-[10px] text-[var(--muted)] truncate">
                      {member.email} · invited
                    </div>
                  )}
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

      {/* Add member sheet */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowAddMember(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
              <button onClick={() => setShowAddMember(false)} className="text-sm font-semibold text-[var(--primary)]">
                Cancel
              </button>
              <span className="text-base font-semibold text-[var(--foreground)]">Add member</span>
              <button onClick={handleAddMember} disabled={isAdding || newName.trim().length < 1} className="text-sm font-semibold text-[var(--primary)] disabled:opacity-40">
                {isAdding ? "Adding..." : "Done"}
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Priya"
                  autoFocus
                  className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Email (optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none"
                />
                <p className="text-[11px] text-[var(--muted)]">With an email, they join automatically when they sign in.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
