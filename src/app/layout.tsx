import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#065F46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "تكافل",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "تكافل",
    "apple-mobile-web-app-title": "تكافل",
    "msapplication-TileColor": "#065F46",
    "msapplication-TileImage": "/icons/icon-144x144.png",
    "msapplication-navbutton-color": "#065F46",
    "msapplication-starturl": "/",
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${ibmPlexArabic.variable} font-sans antialiased`}>
        <SessionProvider>
          <LanguageProvider>
            <Navbar />
            <main className="min-h-[calc(100dvh-4rem)]">
              {children}
            </main>
            <Toaster position="top-center" richColors />
            <NotificationPrompt />
            <PwaProvider />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
