import Link from "next/link";

export default function LandingPage() {
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
          href="/"
          className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium active:opacity-80 transition-opacity"
        >
          Open App
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
            Track group travel expenses with AI receipt scanning, dual-currency ledgers,
            and smart debt simplification. Free forever.
          </p>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold text-center active:opacity-80 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/trip/malaysia-2026"
              className="flex-1 py-3 bg-white border border-[var(--border-color)] text-[var(--foreground)] rounded-xl text-sm font-medium text-center active:opacity-80 transition-opacity"
            >
              See demo
            </Link>
          </div>

          <div className="mt-12 space-y-0 divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
            <div className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">AI Receipt Scan</div>
                  <div className="text-xs text-[var(--muted)]">Snap a photo, we handle the rest</div>
                </div>
              </div>
            </div>

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
                  <div className="text-xs text-[var(--muted)]">Minimize transfers, one-tap UPI</div>
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
              <div className="text-lg font-bold text-[var(--foreground)]">1-tap</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">UPI settle</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
