import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--primary)]/[0.08] blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--accent)]/[0.06] blur-[80px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl text-[var(--foreground)]">SettleUp</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/groups/new" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Sign in
          </Link>
          <Link
            href="/groups/new"
            className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-semibold hover:opacity-90 transition-all btn-press"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 md:pt-28 pb-32">
        <div className="max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/[0.08] border border-[var(--primary)]/20 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs font-semibold text-[var(--primary)] tracking-wide uppercase">Zero paywalls, forever</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <span className="text-[var(--foreground)]">Split expenses,</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">not friendships</span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "160ms" }}>
            Track group travel expenses with AI receipt scanning, dual-currency ledgers, 
            and smart debt simplification. Free forever.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <Link
              href="/groups/new"
              className="group relative px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dim)] rounded-2xl font-semibold text-white text-lg shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 transition-all duration-300 btn-press"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create a group
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/trip/malaysia-2026"
              className="px-8 py-4 bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border-color)] rounded-2xl font-medium text-[var(--foreground)] transition-all btn-press"
            >
              See demo trip
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-5xl mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
          <div className="group p-8 rounded-3xl bg-white border border-[var(--border-color)] shadow-sm card-lift">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-bright)] flex items-center justify-center mb-5 shadow-lg shadow-[var(--primary)]/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">AI Receipt Scan</h3>
            <p className="text-[var(--muted)] leading-relaxed">Snap a photo. We extract items, split them fairly, and track who owes what.</p>
          </div>

          <div className="group p-8 rounded-3xl bg-white border border-[var(--border-color)] shadow-sm card-lift">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-bright)] flex items-center justify-center mb-5 shadow-lg shadow-[var(--accent)]/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Dual Currency</h3>
            <p className="text-[var(--muted)] leading-relaxed">Spend in MYR, settle in INR. Live exchange rates or your own locked rate.</p>
          </div>

          <div className="group p-8 rounded-3xl bg-white border border-[var(--border-color)] shadow-sm card-lift">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--success)] to-emerald-400 flex items-center justify-center mb-5 shadow-lg shadow-[var(--success)]/20 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Smart Settle</h3>
            <p className="text-[var(--muted)] leading-relaxed">Minimize transfers with intelligent debt simplification. One tap to pay via UPI.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full max-w-3xl mt-20 flex items-center justify-center gap-12 md:gap-20 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">0%</div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">Paywall</div>
          </div>
          <div className="w-px h-12 bg-[var(--border-color)]" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">&lt;30s</div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">To log expense</div>
          </div>
          <div className="w-px h-12 bg-[var(--border-color)]" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">1-tap</div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">UPI settle</div>
          </div>
        </div>
      </main>
    </div>
  );
}
