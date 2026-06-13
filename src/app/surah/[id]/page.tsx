import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurah, SURAHS } from "@/data/surahs";
import { fetchSurahWithTranslation, recitationUrl } from "@/lib/quran";
import { strings } from "@/lib/strings";
import { ThemedMascot } from "@/components/ThemedMascot";
import { SurahAudio } from "@/components/SurahAudio";

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
  return {
    title: `Surah ${surah.name} (${surah.meaning}) — ${strings.siteTitle}`,
    description: `Bacaan surah ${surah.name} dengan terjemahan bahasa Indonesia.`,
  };
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
    <div className="flex flex-col gap-5">
      <Link
        href="/surah"
        className="self-start rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-pink-700 shadow-sm ring-2 ring-pink-100 hover:bg-pink-100"
      >
        ← {strings.backToList}
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-200 via-pink-100 to-yellow-100 p-6 shadow-lg ring-4 ring-white/60">
        <div className="dotted absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <ThemedMascot size={96} mood="happy" className="wobble" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-pink-500">
              {strings.surahNumberLabel} {surah.number}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-pink-700 sm:text-4xl">
              {surah.name}
            </h1>
            <p className="mt-1 text-lg font-bold text-pink-900/80">
              {strings.meaningLabel}: <span className="italic">{surah.meaning}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-pink-900/70">
              {surah.verses} {strings.versesLabel} •{" "}
              {strings.revelationLabel} {surah.revelation}
            </p>
          </div>
          <div className="arabic text-pink-700">{surah.arabic}</div>
        </div>
        <div className="relative mt-4">
          <SurahAudio src={recitationUrl(chapter)} />
        </div>
      </section>

      {fetchError && (
        <section className="rounded-2xl bg-amber-100 p-4 text-center text-amber-900 ring-2 ring-amber-200">
          <p className="font-bold">{strings.errorLabel}</p>
          <p className="text-sm">{fetchError}</p>
        </section>
      )}

      {verses && (
        <section className="flex flex-col gap-3">
          {verses.map((v) => (
            <article
              key={v.verse}
              className="rounded-2xl bg-white/95 p-4 shadow-md ring-2 ring-pink-100"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-500 text-sm font-extrabold text-white shadow">
                  {v.verse}
                </span>
                <p className="arabic flex-1 text-right text-pink-900">
                  {v.arabic}
                </p>
              </div>
              {v.translation && (
                <p className="mt-3 border-t border-pink-100 pt-3 text-base font-semibold leading-relaxed text-slate-700">
                  {v.translation}
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
