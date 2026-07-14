"use client";

import Link from "next/link";
import type { Surah } from "@/data/surahs";
import { useStrings } from "@/components/LocaleProvider";
import { SurahAudio } from "@/components/SurahAudio";
import { SurahVerses } from "@/components/SurahVerses";
import { ThemedMascot } from "@/components/ThemedMascot";

interface Verse {
  verse: number;
  arabic: string;
  translation?: string;
}

export function SurahReader({
  surah,
  verses,
  fetchError,
  audioSrc,
}: {
  surah: Surah;
  verses?: Verse[];
  fetchError: string | null;
  audioSrc: string;
}) {
  const strings = useStrings();
  const revelation =
    surah.revelation === "Makkiyah"
      ? strings.revelationMakkiyah
      : strings.revelationMadaniyah;

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
            <h1 className="mt-1 text-3xl font-extrabold text-pink-700 sm:text-4xl">{surah.name}</h1>
            <p className="mt-1 text-lg font-bold text-pink-900/80">
              {strings.meaningLabel}: <span className="italic">{surah.meaning}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-pink-900/70">
              {surah.verses} {strings.versesLabel} • {strings.revelationLabel} {revelation}
            </p>
          </div>
          <div className="arabic text-pink-700">{surah.arabic}</div>
        </div>
        <div className="relative mt-4">
          <SurahAudio src={audioSrc} />
        </div>
      </section>

      {fetchError && (
        <section className="rounded-2xl bg-amber-100 p-4 text-center text-amber-900 ring-2 ring-amber-200">
          <p className="font-bold">{strings.errorLabel}</p>
          <p className="text-sm">{fetchError}</p>
        </section>
      )}

      {verses && <SurahVerses surahNumber={surah.number} verses={verses} />}
    </div>
  );
}
