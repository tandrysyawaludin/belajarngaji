import type { Metadata } from "next";
import { CloudLetterGame } from "@/components/CloudLetterGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardCloudTitle} — ${strings.siteTitle}`,
  description: strings.cloudPageDesc,
  path: "/huruf-awan",
});

export default function CloudPage() {
  return <CloudLetterGame />;
}
