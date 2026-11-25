import type { Metadata } from "next";
import { BuildMosqueGame } from "@/components/BuildMosqueGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardBuildTitle} — ${strings.siteTitle}`,
  description: strings.buildPageDesc,
  path: "/bangun-masjid",
});

export default function BuildMosquePage() {
  return <BuildMosqueGame />;
}
