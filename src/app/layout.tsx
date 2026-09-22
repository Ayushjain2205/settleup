import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";
import { BootSplash } from "@/components/boot-splash";
import { Toaster } from "@/components/toast";
import { PerfHud } from "@/components/perf-hud";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SettleUp — Group Expense Tracker",
  description: "Track group expenses, split bills, and settle up with friends. Zero paywalls, dual-currency support, and smart debt simplification.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SettleUp",
    startupImage: [{ url: "/splash/splash-1290x2796.png" }],
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BootSplash />
        <SwRegister />
        <Providers>{children}</Providers>
        <Toaster />
        <PerfHud />
      </body>
    </html>
  );
}
