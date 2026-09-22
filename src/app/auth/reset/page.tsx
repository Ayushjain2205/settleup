"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/error";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [status, setStatus] = useState<"verifying" | "ready" | "invalid">("verifying");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        setStatus(error ? "invalid" : "ready");
        if (error) setError("This reset link is invalid or expired. Request a new one.");
      });
    } else if (tokenHash) {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: (type as "recovery") || "recovery" })
        .then(({ error }) => {
          setStatus(error ? "invalid" : "ready");
          if (error) setError("This reset link is invalid or expired. Request a new one.");
        });
    } else {
      setStatus("invalid");
      setError("This reset link is invalid or expired. Request a new one.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/");
    } catch (err) {
      setError(errorMessage(err, "Could not update password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--background)] flex flex-col px-6 pt-16 pb-8">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-6">
        <span className="text-white text-xl font-bold">S</span>
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Set new password</h1>
      <p className="text-sm text-[var(--muted)] mt-1 mb-8">
        {status === "verifying" ? "Verifying your link..." : status === "ready" ? "Choose something memorable" : "That link didn't work"}
      </p>

      {status === "ready" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Please wait..." : "Update password"}
          </button>
        </form>
      )}

      {status === "invalid" && (
        <>
          {error && (
            <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-3">{error}</p>
          )}
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity"
          >
            Back to sign in
          </button>
        </>
      )}
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
