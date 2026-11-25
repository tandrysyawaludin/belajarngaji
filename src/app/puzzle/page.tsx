import type { Metadata } from "next";
import { PuzzleGame } from "@/components/PuzzleGame";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${strings.cardPuzzleTitle} — ${strings.siteTitle}`,
  description: strings.puzzlePageDesc,
  path: "/puzzle",
});

export default function PuzzlePage() {
  return <PuzzleGame />;
}
