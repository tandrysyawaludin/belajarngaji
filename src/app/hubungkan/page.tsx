import type { Metadata } from "next";
import { ConnectGame } from "@/components/ConnectGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardLinkTitle} — ${strings.siteTitle}`,
  description: strings.linkPageDesc,
  path: "/hubungkan",
});

export default function Page() {
  return <ConnectGame />;
}
