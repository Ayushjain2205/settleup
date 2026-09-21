export default function ActivityLoading() {
  return (
    <div className="min-h-dvh bg-[var(--background)] animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <div className="h-5 w-24 rounded bg-[var(--border-color)]" />
        </div>
      </header>
      <main>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--border-color)] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-[var(--border-color)]" />
                <div className="h-2.5 w-1/2 rounded bg-[var(--border-color)]" />
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
