import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";

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
    startupImage: [
      { url: "/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/splash-1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
    ],
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
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
