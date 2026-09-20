import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SettleUp — Group Expense Tracker",
    short_name: "SettleUp",
    description: "Track group expenses, split bills, and settle up with friends.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
