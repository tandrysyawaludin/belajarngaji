import type { Metadata } from "next";
import { GamesContent } from "@/components/GamesContent";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Game Belajar Al-Qur'an untuk Anak — ${strings.navGames}`,
  description: strings.seoGamesBlurb,
  path: "/games",
});

export default function GamesPage() {
  return <GamesContent />;
}
