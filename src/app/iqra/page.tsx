import type { Metadata } from "next";
import { IqraPageContent } from "@/components/IqraPageContent";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Iqra Online Gratis — Belajar Huruf Hijaiyah Jilid 1–6`,
  description: strings.seoIqraBlurb,
  path: "/iqra",
});

export default function IqraPage() {
  return <IqraPageContent />;
}
