export default function GroupsLoading() {
  return (
    <div className="min-h-dvh bg-[var(--background)] animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="h-5 w-20 rounded bg-[var(--border-color)]" />
          <div className="w-6 h-6 rounded bg-[var(--border-color)]" />
        </div>
      </header>
      <main>
        <div className="px-4 pt-4 pb-2">
          <div className="h-3 w-16 rounded bg-[var(--border-color)]" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-[var(--border-color)]" />
                <div className="h-2.5 w-1/3 rounded bg-[var(--border-color)]" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
