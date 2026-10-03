import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

// Self-hosted at build time, so no request goes to Google Fonts at runtime.
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-hanken" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-newsreader" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "Orbit",
  description: "A private tutor for every student, with the teacher at the center.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${newsreader.variable} ${plex.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
