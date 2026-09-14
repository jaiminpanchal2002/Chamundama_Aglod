import type { Metadata, Viewport } from "next";
import {
  Noto_Sans_Gujarati,
  Cinzel,
  Cormorant_Garamond,
  Inter,
} from "next/font/google";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const gujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gujarati",
  display: "swap",
});
const display = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "શ્રી ચામુંડા ધામ આગલોડ | Shree Chamunda Dham Aglod",
    template: "%s | શ્રી ચામુંડા ધામ આગલોડ",
  },
  description:
    "શ્રી ચામુંડા ધામ, આગલોડ — Official website of Shree Chamunda Dham, Aglod (Vijapur, Gujarat). Darshan timings, festivals, seva and temple information.",
  openGraph: {
    type: "website",
    siteName: "Shree Chamunda Dham Aglod",
    locale: "gu_IN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#7a1220",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${gujarati.variable} ${display.variable} ${serif.variable} ${sans.variable}`}
    >
      <body className={locale === "gu" ? "lang-gu" : undefined}>{children}</body>
    </html>
  );
}
