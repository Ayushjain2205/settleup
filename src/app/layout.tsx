import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";
import { SplashRemover } from "@/components/boot-splash";

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
        <div
          id="app-splash"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#7c3aed",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "#fff", fontSize: 72, fontWeight: 800, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>
            S
          </span>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 17, fontWeight: 600, fontFamily: "system-ui, sans-serif", letterSpacing: 0.5 }}>
            SettleUp
          </span>
        </div>
        <SplashRemover />
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
