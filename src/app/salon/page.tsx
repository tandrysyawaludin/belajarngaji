import type { Metadata } from "next";
import { SalonGame } from "@/components/SalonGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardSalonTitle} — ${strings.siteTitle}`,
  description: strings.salonPageDesc,
  path: "/salon",
});

export default function SalonPage() {
  return <SalonGame />;
}
