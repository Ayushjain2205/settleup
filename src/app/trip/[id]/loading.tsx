export default function TripLoading() {
  return (
    <div className="min-h-dvh bg-[var(--background)] animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <div className="w-5 h-5 rounded bg-[var(--border-color)] mr-3" />
          <div className="h-5 w-32 rounded bg-[var(--border-color)]" />
        </div>
        <div className="flex px-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 py-2.5 flex justify-center">
              <div className="h-3 w-14 rounded bg-[var(--border-color)]" />
            </div>
          ))}
        </div>
      </header>
      <main>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="list-item bg-white border-b border-[var(--border-color)]">
            <div className="w-9 h-9 rounded-lg bg-[var(--border-color)] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-[var(--border-color)]" />
              <div className="h-2.5 w-1/3 rounded bg-[var(--border-color)]" />
            </div>
            <div className="h-3.5 w-12 rounded bg-[var(--border-color)] flex-shrink-0" />
          </div>
        ))}
      </main>
    </div>
  );
}
