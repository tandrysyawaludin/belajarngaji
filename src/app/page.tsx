import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.siteTitle} — Belajar Ngaji Online Gratis untuk Anak`,
  description: strings.siteDescription,
  path: "/",
});

export default function Home() {
  return <HomeContent />;
}
