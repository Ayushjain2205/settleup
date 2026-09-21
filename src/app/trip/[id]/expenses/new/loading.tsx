export default function ExpenseLoading() {
  return (
    <div className="min-h-dvh bg-[var(--background)] flex flex-col animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <div className="w-5 h-5 rounded bg-[var(--border-color)] mr-3" />
          <div className="flex-1 flex justify-center">
            <div className="h-4 w-28 rounded bg-[var(--border-color)]" />
          </div>
          <div className="h-4 w-10 rounded bg-[var(--border-color)]" />
        </div>
      </header>
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="h-8 w-48 rounded-full bg-[var(--border-color)]" />
      </div>
      <main className="flex-1 flex flex-col px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex-shrink-0" />
          <div className="flex-1 h-8 rounded bg-[var(--border-color)]" />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex-shrink-0" />
          <div className="flex-1 h-10 rounded bg-[var(--border-color)]" />
        </div>
        <div className="flex justify-center">
          <div className="h-8 w-64 rounded-lg bg-[var(--border-color)]" />
        </div>
      </main>
    </div>
  );
}
