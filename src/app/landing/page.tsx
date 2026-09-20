import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-base text-[var(--foreground)]">SettleUp</span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium active:opacity-80 transition-opacity"
        >
          Sign in
        </Link>
      </nav>

      <main className="px-5 pt-12 pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-[var(--foreground)] leading-tight mb-3">
            Split expenses,
            <br />
            not friendships
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-8">
            Track group travel expenses with dual-currency ledgers and smart
            debt simplification. Free forever.
          </p>

          <Link
            href="/login?mode=signup"
            className="block w-full py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold text-center active:opacity-80 transition-opacity"
          >
            Get started
          </Link>

          <div className="mt-12 space-y-0 divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
            <div className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Dual Currency</div>
                  <div className="text-xs text-[var(--muted)]">Spend in MYR, settle in INR</div>
                </div>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Smart Settle</div>
                  <div className="text-xs text-[var(--muted)]">Fewer transfers, settled fairly</div>
                </div>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Flexible Splits</div>
                  <div className="text-xs text-[var(--muted)]">Equal, exact, percentage, or by item</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-[var(--foreground)]">0%</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Paywall</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--foreground)]">&lt;30s</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">To log</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--foreground)]">∞</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Groups</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
