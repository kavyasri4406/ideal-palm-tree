import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "AgriPredict — AI Agricultural Market Intelligence",
  description: "Real-time crop prices, APMC mandi rates, AI predictions, live weather integration, and smart recommendations for farmers across India.",
  keywords: "crop price prediction, agricultural market, mandi prices, kisan, farmer app, AI farming India, APMC",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriPredict",
  },
};

export const viewport: Viewport = {
  themeColor: "#5C7A3E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
