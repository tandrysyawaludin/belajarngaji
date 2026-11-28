import type { Metadata } from "next";
import { PrayerGuideContent } from "@/components/PrayerGuideContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tuntunan Sholat untuk Anak — Wudu dan Bacaan Sholat",
  description:
    "Panduan sholat mudah untuk anak: lima waktu sholat dan jumlah rakaatnya, langkah wudu, serta gerakan sholat lengkap dengan bacaan Arab, latin, dan artinya.",
  path: "/tuntunan-sholat",
});

export default function TuntunanSholatPage() {
  return <PrayerGuideContent />;
}
