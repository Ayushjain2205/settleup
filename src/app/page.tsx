import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl text-[var(--foreground)]">SettleUp</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Split expenses,<br />
            <span className="text-[var(--primary)]">not friendships</span>
          </h1>
          <p className="text-lg text-[var(--muted)] mb-8">
            Track group expenses, scan receipts with AI, and settle up with zero hassle. 
            Dual-currency support for international trips.
          </p>
          <Link
            href="/groups/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold text-lg hover:bg-[var(--primary-dark)] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create a Group
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="p-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--muted)]">
          Zero paywalls • AI receipt scanning • Smart debt simplification
        </div>
      </footer>
    </div>
  );
}
