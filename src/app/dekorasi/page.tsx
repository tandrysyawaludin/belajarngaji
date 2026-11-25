import type { Metadata } from "next";
import { DecorateGame } from "@/components/DecorateGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardDecorateTitle} — ${strings.siteTitle}`,
  description: strings.decoratePageDesc,
  path: "/dekorasi",
});

export default function DecoratePage() {
  return <DecorateGame />;
}
