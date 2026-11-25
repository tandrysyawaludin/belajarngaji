"use client";

import Link from "next/link";
import { ContinueReading } from "@/components/ContinueReading";
import { useStrings } from "@/components/LocaleProvider";
import type { Surah } from "@/data/surahs";

const PALETTES = [
  "from-sky-pink00 to-sky-rose00 text-sky-rose00 ring-sky-rose00",
  "from-sky-200 to-blue-200 text-blue-900 ring-blue-200",
  "from-sky-yellow00 to-sky-amber00 text-sky-amber00 ring-sky-amber00",
  "from-sky-emerald00 to-sky-teal00 text-sky-emerald00 ring-sky-emerald00",
  "from-sky-violet00 to-sky-fuchsia00 text-sky-fuchsia00 ring-sky-fuchsia00",
  "from-orange-200 to-sky-pink00 text-orange-900 ring-orange-200",
];

export function SurahListContent({ surahs }: { surahs: Surah[] }) {
  const strings = useStrings();

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-sky-pink00">
        <h1 className="text-2xl font-extrabold text-sky-pink00 sm:text-3xl">{strings.navSurah}</h1>
        <p className="mt-1 text-base font-semibold text-sky-pink00/70">{strings.seoSurahListBlurb}</p>
      </section>
      <ContinueReading />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {surahs.map((s) => {
          const palette = PALETTES[(s.number - 1) % PALETTES.length];
          return (
            <Link
              key={s.number}
              href={`/surah/${s.number}`}
              className={`group relative flex flex-col gap-1 overflow-hidden rounded-2xl bg-gradient-to-br p-3 shadow-sm ring-2 transition hover:scale-[1.02] active:scale-95 ${palette}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-sm font-extrabold">
                  {s.number}
                </span>
                <span className="arabic text-lg" style={{ direction: "rtl" }}>
                  {s.arabic}
                </span>
              </div>
              <h2 className="mt-1 text-base font-extrabold">{s.name}</h2>
              <p className="text-xs font-semibold opacity-80">
                {s.meaning} • {s.verses} {strings.versesLabel}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
