"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/error";
import { isValidJoinCode, normalizeJoinCode } from "@/lib/join-code";

export default function JoinPage() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const normalized = normalizeJoinCode(code);
  const canJoin = isValidJoinCode(code) && !isJoining;

  const handleJoin = async () => {
    if (!canJoin) return;
    setIsJoining(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.rpc("join_group", { p_code: normalized });
      if (error) throw error;
      router.push(`/trip/${data}`);
    } catch (err) {
      setError(errorMessage(err, "Could not join group"));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--background)] flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">Join group</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 pt-12">
        <p className="text-sm text-[var(--muted)] text-center mb-6">
          Ask a member for the 6-letter group code
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          placeholder="••••••"
          autoFocus
          autoCapitalize="characters"
          autoCorrect="off"
          className="w-full text-center text-3xl font-bold tracking-[0.3em] text-[var(--foreground)] bg-white border border-[var(--border-color)] rounded-2xl py-4 placeholder:text-[var(--border-color)] focus:outline-none focus:border-[var(--primary)] transition-colors tabular-nums"
        />

        {error && (
          <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5 mt-4 text-center">{error}</p>
        )}

        <div className="flex-1" />

        <div className="pb-8">
          <button
            onClick={handleJoin}
            disabled={!canJoin}
            className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-40"
          >
            {isJoining ? "Joining..." : "Join group"}
          </button>
        </div>
      </main>
    </div>
  );
}
