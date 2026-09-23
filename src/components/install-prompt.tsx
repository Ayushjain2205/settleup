"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "settleup-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // storage unavailable — still offer install
    }
    setDismissed(false);

    const ua = window.navigator.userAgent;
    setIsIos(/iphone|ipad|ipod/i.test(ua));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      try {
        window.localStorage.setItem(DISMISSED_KEY, "1");
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  // Android/Chrome: native install trigger. iOS: no API exists,
  // so show the manual steps instead.
  if (!isIos && !deferred) return null;

  return (
    <div className="fixed bottom-[calc(5rem+var(--safe-bottom))] left-4 right-4 z-[55]">
      <div className="bg-[var(--foreground)] text-[var(--background)] rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold">Install SettleUp</div>
          <div className="text-[10px] opacity-70">
            {isIos ? "Share → Add to Home Screen" : "Faster access, works like an app"}
          </div>
        </div>
        {isIos ? (
          <button onClick={dismiss} className="text-xs font-semibold text-[var(--background)]/80 px-2 py-1">
            Got it
          </button>
        ) : (
          <button onClick={handleInstall} className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold">
            Install
          </button>
        )}
        {!isIos && (
          <button onClick={dismiss} className="text-[var(--background)]/60 px-1" aria-label="Dismiss">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
