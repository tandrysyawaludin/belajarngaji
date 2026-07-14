import type { Metadata } from "next";
import { SurahListContent } from "@/components/SurahListContent";
import { SURAHS } from "@/data/surahs";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Baca Al-Qur'an Online — ${strings.navSurah} 114 Surah`,
  description: strings.seoSurahListBlurb,
  path: "/surah",
});

const SURAHS_DESC = [...SURAHS].reverse();

export default function SurahListPage() {
  return <SurahListContent surahs={SURAHS_DESC} />;
}
