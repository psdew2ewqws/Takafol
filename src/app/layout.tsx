import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
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
            <main className="min-h-[calc(100dvh-4rem)] pb-20 md:pb-0">
              {children}
            </main>
            <BottomNav />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
