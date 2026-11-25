"use client";

import Link from "next/link";
import { useStrings } from "@/components/LocaleProvider";
import { CloudPuppy } from "@/components/CloudPuppy";

const cards = [
  { href: "/surah", titleKey: "cardSurahTitle" as const, descKey: "cardSurahDesc" as const, bg: "from-sky-300 to-blue-400", emoji: "📖" },
  { href: "/iqra", titleKey: "cardIqraTitle" as const, descKey: "cardIqraDesc" as const, bg: "from-teal-300 to-sky-400", emoji: "🕌" },
  { href: "/games", titleKey: "cardGamesTitle" as const, descKey: "cardGamesDesc" as const, bg: "from-pink-200 to-rose-200", emoji: "🎮" },
  { href: "/riwayat", titleKey: "cardHistoryTitle" as const, descKey: "cardHistoryDesc" as const, bg: "from-violet-300 to-sky-300", emoji: "📊" },
] as const;

export function HomeContent() {
  const strings = useStrings();

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-200 via-white to-amber-50 p-6 shadow-lg ring-4 ring-white/70 sm:p-8">
        <div className="dotted absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="floaty">
            <CloudPuppy size={170} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-sky-500">{strings.homeHello}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-sky-700 sm:text-4xl">
              {strings.siteTitle} <span className="text-2xl sm:text-3xl">✨</span>
            </h1>
            <p className="mt-2 text-lg font-semibold text-sky-900/80">{strings.homeIntro}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-4 ring-sky-100">
        <h2 className="text-xl font-extrabold text-sky-700">{strings.homeSectionTitle}</h2>
        <p className="mt-2 text-base font-semibold leading-relaxed text-sky-900/80">
          {strings.seoHomeBlurb}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-xl ring-4 ring-white/50 transition hover:scale-[1.02] active:scale-95 ${c.bg}`}
          >
            <div className="dotted absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/35 text-3xl shadow-inner ring-2 ring-white/70 transition group-hover:scale-110">{c.emoji}</span>
              <div>
                <h2 className="text-2xl font-extrabold drop-shadow-sm">{strings[c.titleKey]}</h2>
                <p className="mt-2 text-base font-semibold leading-snug text-white/95">{strings[c.descKey]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
