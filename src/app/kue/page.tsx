import type { Metadata } from "next";
import { CakeGame } from "@/components/CakeGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardCakeTitle} — ${strings.siteTitle}`,
  description: strings.cakePageDesc,
  path: "/kue",
});

export default function CakePage() {
  return <CakeGame />;
}
