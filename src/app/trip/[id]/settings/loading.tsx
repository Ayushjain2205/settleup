export default function SettingsLoading() {
  return (
    <div className="min-h-dvh bg-[var(--background)] animate-pulse">
      <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <div className="w-5 h-5 rounded bg-[var(--border-color)] mr-3" />
          <div className="h-5 w-24 rounded bg-[var(--border-color)]" />
        </div>
      </header>
      <main>
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="h-4 w-32 rounded bg-[var(--border-color)]" />
          <div className="h-3 w-48 rounded bg-[var(--border-color)] mt-2" />
        </div>
        <div className="px-4 py-3 bg-white border-b border-[var(--border-color)]">
          <div className="h-4 w-28 rounded bg-[var(--border-color)] mb-2" />
          <div className="h-8 rounded-lg bg-[var(--border-color)]" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-full bg-[var(--border-color)] flex-shrink-0" />
            <div className="h-3.5 w-24 rounded bg-[var(--border-color)]" />
          </div>
        ))}
      </main>
    </div>
  );
}
