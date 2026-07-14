import { notFound } from "next/navigation";
import { SurahReader } from "@/components/SurahReader";
import { getSurah, SURAHS } from "@/data/surahs";
import { fetchSurahWithTranslation, recitationUrl } from "@/lib/quran";
import { strings } from "@/lib/strings";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return SURAHS.map((s) => ({ id: String(s.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surah = getSurah(Number.parseInt(id, 10));
  if (!surah) return { title: strings.siteTitle };
  const path = `/surah/${surah.number}`;
  const description = `Baca surah ${surah.name} (${surah.meaning}) lengkap ${surah.verses} ayat dengan terjemahan Indonesia dan audio murottal. Gratis di Belajar Ngaji untuk anak-anak.`;
  return pageMetadata({
    title: `Surah ${surah.name} (${surah.meaning}) — Baca Online`,
    description,
    path,
  });
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = Number.parseInt(id, 10);
  const surah = getSurah(chapter);
  if (!surah) notFound();

  let verses;
  let fetchError: string | null = null;
  try {
    verses = await fetchSurahWithTranslation(chapter);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Gagal memuat";
  }

  return (
    <SurahReader
      surah={surah}
      verses={verses}
      fetchError={fetchError}
      audioSrc={recitationUrl(chapter)}
    />
  );
}
