"use client";

import Link from "next/link";
import type { Surah } from "@/data/surahs";
import { useStrings } from "@/components/LocaleProvider";
import { PrintButton } from "@/components/PrintButton";
import { SurahAudio } from "@/components/SurahAudio";
import { SurahVerses } from "@/components/SurahVerses";
import { CloudPuppy } from "@/components/CloudPuppy";

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
    <div className="printable-root flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/surah"
          className="print-hide self-start rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm ring-2 ring-sky-200 hover:bg-sky-100"
        >
          ← {strings.backToList}
        </Link>
        <PrintButton className="rounded-full bg-white/90 text-sky-700 ring-2 ring-sky-200" />
      </div>

      <p className="print-only text-center text-sm font-bold text-stone-600">
        {strings.siteTitle} · {strings.surahNumberLabel} {surah.number} · {surah.name}
      </p>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 p-6 shadow-lg ring-4 ring-white/60">
        <div className="dotted absolute inset-0 opacity-40 print:hidden" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <CloudPuppy size={96} className="wobble print-hide" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
              {strings.surahNumberLabel} {surah.number}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-sky-700 sm:text-4xl">{surah.name}</h1>
            <p className="mt-1 text-lg font-bold text-sky-900/80">
              {strings.meaningLabel}: <span className="italic">{surah.meaning}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-sky-900/70">
              {surah.verses} {strings.versesLabel} • {strings.revelationLabel} {revelation}
            </p>
          </div>
          <div className="arabic text-sky-700">{surah.arabic}</div>
        </div>
        <div className="relative mt-4 print-hide">
          <SurahAudio src={audioSrc} />
        </div>
      </section>

      {fetchError && (
        <section className="rounded-2xl bg-sky-100 p-4 text-center text-sky-700 ring-2 ring-sky-200">
          <p className="font-bold">{strings.errorLabel}</p>
          <p className="text-sm">{fetchError}</p>
        </section>
      )}

      {verses && <SurahVerses surahNumber={surah.number} verses={verses} />}
    </div>
  );
}
