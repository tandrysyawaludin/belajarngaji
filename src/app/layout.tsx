import type { Metadata, Viewport } from "next";
import { Quicksand, Amiri, Noto_Naskh_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
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

const siteUrl = new URL("https://belajarngaji.my.id");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${strings.siteTitle} — ${strings.siteTagline}`,
  description: strings.siteDescription,
  applicationName: strings.siteTitle,
  keywords: [
    "belajar ngaji",
    "belajar Al-Qur'an",
    "Iqra online",
    "Iqra anak",
    "surah Al-Qur'an",
    "kuis Al-Qur'an",
    "game edukasi Islam",
    "belajar membaca Al-Qur'an",
  ],
  authors: [{ name: strings.siteTitle, url: siteUrl }],
  creator: strings.siteTitle,
  publisher: strings.siteTitle,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: strings.siteTitle,
    title: `${strings.siteTitle} — ${strings.siteTagline}`,
    description: strings.siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${strings.siteTitle} - aplikasi belajar Al-Qur'an untuk anak`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${strings.siteTitle} — ${strings.siteTagline}`,
    description: strings.siteDescription,
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#fb6f92",
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
      suppressHydrationWarning
    >
      <head>
        {/* Sync-set the data-theme attribute *before* paint so the kid never
            sees a flash of the wrong palette on first render. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
