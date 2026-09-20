"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/bottom-nav";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "You";
  const initial = displayName[0]?.toUpperCase() || "Y";

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
              {initial}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-[var(--foreground)]">{displayName}</div>
              <div className="text-xs text-[var(--muted)]">{user?.email || "Not signed in"}</div>
            </div>
            {user ? (
              <button onClick={handleSignOut} className="text-xs font-semibold text-[var(--error)]">
                Sign out
              </button>
            ) : (
              <Link href="/login" className="text-xs font-semibold text-[var(--primary)]">
                Sign in
              </Link>
            )}
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
