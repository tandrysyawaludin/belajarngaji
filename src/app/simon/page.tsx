import type { Metadata } from "next";
import { SimonGame } from "@/components/SimonGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardSimonTitle} — ${strings.siteTitle}`,
  description: strings.simonPageDesc,
  path: "/simon",
});

export default function Page() {
  return <SimonGame />;
}
