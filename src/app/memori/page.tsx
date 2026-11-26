import type { Metadata } from "next";
import { MemoryGame } from "@/components/MemoryGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardMemoryTitle} — ${strings.siteTitle}`,
  description: strings.memoryPageDesc,
  path: "/memori",
});

export default function Page() {
  return <MemoryGame />;
}
