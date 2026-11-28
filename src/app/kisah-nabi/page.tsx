import type { Metadata } from "next";
import { ProphetStoriesContent } from "@/components/ProphetStoriesContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kisah Para Nabi untuk Anak — Dari Adam sampai Muhammad",
  description:
    "Cerita 25 nabi dan rasul untuk anak, dari Nabi Adam sampai Nabi Muhammad, ditulis dengan bahasa sederhana dan bisa didengarkan.",
  path: "/kisah-nabi",
});

export default function KisahNabiPage() {
  return <ProphetStoriesContent />;
}
