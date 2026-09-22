"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/queries";
import { errorMessage } from "@/lib/error";
import { success } from "@/lib/haptics";
import { toast } from "@/components/toast";
import { BottomNav } from "@/components/bottom-nav";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: session, isLoading: loading } = useSession();
  const user = session?.user || null;
  const [showChange, setShowChange] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/login");
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (newPw.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords don't match");
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setNewPw("");
      setConfirmPw("");
      setShowChange(false);
      success();
      toast("Password updated");
    } catch (err) {
      setPwError(errorMessage(err, "Could not update password"));
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "You";
  const initial = displayName[0]?.toUpperCase() || "Y";

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Account</h1>
        </div>
      </header>

      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        {loading ? (
          <div className="px-4 py-4 bg-white border-b border-[var(--border-color)] animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--border-color)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-[var(--border-color)]" />
                <div className="h-3 w-48 rounded bg-[var(--border-color)]" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="px-4 py-4 bg-white border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-base font-bold text-white">
                  {initial}
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-[var(--foreground)]">{displayName}</div>
                  <div className="text-xs text-[var(--muted)]">{user?.email || "Not signed in"}</div>
                </div>
                {user ? (
                  <button onClick={handleSignOut} className="text-xs font-semibold text-[var(--error)]">
                    Sign out
                  </button>
                ) : (
                  <Link href="/login" className="text-xs font-semibold text-[var(--primary)]">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        {user && (
          <div className="mt-4 bg-white border-y border-[var(--border-color)]">
            <button onClick={() => { setShowChange((s) => !s); setPwError(null); }} className="w-full flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Change password</span>
              <svg className={`w-4 h-4 text-[var(--muted)] transition-transform ${showChange ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showChange && (
              <div className="px-4 pb-4 space-y-3">
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="New password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none"
                />
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none"
                />
                {pwError && (
                  <p className="text-xs font-medium text-[var(--error)]">{pwError}</p>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={isUpdating}
                  className="w-full py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update password"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-6 text-center">
          <p className="text-[10px] text-[var(--muted)]">SettleUp v0.1.0</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
