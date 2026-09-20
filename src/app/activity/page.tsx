import { BottomNav } from "@/components/bottom-nav";

const ACTIVITY = [
  { id: 1, user: "Priya", action: "added expense", detail: "Lunch at Nasi Kandar", amount: "₹1,632", time: "2 hours ago", trip: "Malaysia Trip 2026" },
  { id: 2, user: "Rahul", action: "settled up", detail: null, amount: "₹360", time: "5 hours ago", trip: "Malaysia Trip 2026" },
  { id: 3, user: "You", action: "added expense", detail: "Airport taxi to hotel", amount: "₹3,456", time: "Yesterday", trip: "Malaysia Trip 2026" },
  { id: 4, user: "Vikram", action: "added expense", detail: "Beach shack dinner", amount: "₹2,400", time: "Jan 1", trip: "Goa New Year 2025" },
  { id: 5, user: "Anita", action: "joined", detail: null, amount: null, time: "Dec 28", trip: "Malaysia Trip 2026" },
  { id: 6, user: "Meera", action: "settled up", detail: null, amount: "₹2,400", time: "Jan 2", trip: "Goa New Year 2025" },
];

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Activity</h1>
        </div>
      </header>

      <main className="pb-20">
        <div className="divide-y divide-[var(--border-color)]">
          {ACTIVITY.map((item) => (
            <div key={item.id} className="px-4 py-3 bg-white">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {item.user[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--foreground)]">
                    <span className="font-semibold">{item.user}</span>{" "}
                    <span className="text-[var(--muted)]">{item.action}</span>
                    {item.detail && (
                      <span className="font-medium"> {item.detail}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-[var(--muted)]">{item.trip} · {item.time}</span>
                    {item.amount && (
                      <span className="text-xs font-semibold text-[var(--foreground)]">{item.amount}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
