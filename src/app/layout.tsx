import type { Metadata, Viewport } from "next";
import { Quicksand, Amiri, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { strings } from "@/lib/strings";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

// Noto Naskh Arabic ships glyphs for the broad Arabic Unicode range and acts
// as a safety net for any mark Amiri does not cover.
const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: `${strings.siteTitle} — ${strings.siteTagline}`,
  description: strings.siteDescription,
  applicationName: strings.siteTitle,
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff7eb6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${quicksand.variable} ${amiri.variable} ${notoArabic.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
