"use client";

import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";

export default function AccountPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("you@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Account</h1>
        </div>
      </header>

      <main className="pb-20">
        {/* Profile */}
        <div className="px-4 py-4 bg-white border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-base font-bold text-white">
              Y
            </div>
            <div>
              <div className="text-base font-semibold text-[var(--foreground)]">You</div>
              <div className="text-xs text-[var(--muted)]">you@upi</div>
            </div>
          </div>
        </div>

        {/* Settings list */}
        <div className="mt-4">
          <div className="px-4 py-2">
            <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Payment</span>
          </div>

          <div className="bg-white border-y border-[var(--border-color)]">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">UPI ID</div>
                <div className="text-[11px] text-[var(--muted)]">you@upi</div>
              </div>
              <button onClick={handleCopy} className="text-xs font-semibold text-[var(--primary)]">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="px-4 py-2 mt-4">
            <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Preferences</span>
          </div>

          <div className="bg-white border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Default currency</span>
              <span className="text-sm text-[var(--muted)]">INR</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Notifications</span>
              <div className="w-10 h-6 rounded-full bg-[var(--success)] relative">
                <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Dark mode</span>
              <div className="w-10 h-6 rounded-full bg-[var(--border-color)] relative">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>

          <div className="px-4 py-2 mt-4">
            <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Support</span>
          </div>

          <div className="bg-white border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            <div className="px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Help center</span>
            </div>
            <div className="px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Send feedback</span>
            </div>
            <div className="px-4 py-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Privacy policy</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 text-center">
          <p className="text-[10px] text-[var(--muted)]">SettleUp v0.1.0</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
