"use client";

import { useEffect } from "react";

export function SplashRemover() {
  useEffect(() => {
    const t1 = setTimeout(() => {
      document.getElementById("app-splash")?.style.setProperty("opacity", "0");
    }, 300);
    const t2 = setTimeout(() => {
      document.getElementById("app-splash")?.remove();
    }, 750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return null;
}
