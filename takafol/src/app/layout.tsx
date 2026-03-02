import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Takafol by Nexara",
  description: "Verified impact through blockchain transparency. Donate, volunteer, and track your real-world impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
