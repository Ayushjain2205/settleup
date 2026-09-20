"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (error) throw error;
        // If email confirmation is on, there is no session yet
        if (!data.session) {
          setInfo("Check your email for a confirmation link.");
        } else {
          router.push("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col px-6 pt-16 pb-8">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-6">
        <span className="text-white text-xl font-bold">S</span>
      </div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
        {mode === "signin" ? "Welcome back" : "Create account"}
      </h1>
      <p className="text-sm text-[var(--muted)] mt-1 mb-8">
        {mode === "signin" ? "Sign in to track expenses with friends" : "Sign up to start splitting bills"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-3">{error}</p>
        )}
        {info && (
          <p className="text-xs font-medium text-[var(--success)] bg-[var(--success)]/5 border border-[var(--success)]/20 rounded-xl px-4 py-3">{info}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="flex-1" />

      <button
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
        className="text-sm text-[var(--muted)]"
      >
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <span className="font-semibold text-[var(--primary)]">{mode === "signin" ? "Sign up" : "Sign in"}</span>
      </button>
    </div>
  );
}
