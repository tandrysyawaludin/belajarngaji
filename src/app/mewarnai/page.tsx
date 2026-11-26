import type { Metadata } from "next";
import { ColoringGame } from "@/components/ColoringGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardColorTitle} — ${strings.siteTitle}`,
  description: strings.colorPageDesc,
  path: "/mewarnai",
});

export default function Page() {
  return <ColoringGame />;
}
