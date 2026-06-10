import Link from "next/link";
import { strings } from "@/lib/strings";
import { Mascot } from "@/components/Mascot";

const cards = [
  {
    href: "/surah",
    title: strings.cardSurahTitle,
    desc: strings.cardSurahDesc,
    bg: "from-sky-300 to-blue-400",
    emoji: "📖",
  },
  {
    href: "/kuis",
    title: strings.cardQuizTitle,
    desc: strings.cardQuizDesc,
    bg: "from-yellow-300 to-orange-400",
    emoji: "⭐",
  },
  {
    href: "/cocokkan",
    title: strings.cardMatchTitle,
    desc: strings.cardMatchDesc,
    bg: "from-emerald-300 to-teal-400",
    emoji: "🎯",
  },
  {
    href: "/tebak-ayat",
    title: strings.cardGuessTitle,
    desc: strings.cardGuessDesc,
    bg: "from-violet-300 to-fuchsia-400",
    emoji: "🔢",
  },
  {
    href: "/sambung",
    title: strings.cardConnectTitle,
    desc: strings.cardConnectDesc,
    bg: "from-orange-300 to-rose-400",
    emoji: "🔗",
  },
  {
    href: "/riwayat",
    title: strings.cardHistoryTitle,
    desc: strings.cardHistoryDesc,
    bg: "from-rose-300 to-pink-400",
    emoji: "📊",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-200 via-pink-100 to-yellow-100 p-6 shadow-lg ring-4 ring-white/60 sm:p-8">
        <div className="dotted absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="wobble">
            <Mascot size={140} mood="excited" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-pink-500">
              {strings.homeHello}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-pink-700 sm:text-4xl">
              {strings.siteTitle}{" "}
              <span className="text-2xl sm:text-3xl">✨</span>
            </h1>
            <p className="mt-2 text-lg font-semibold text-pink-900/80">
              {strings.homeIntro}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl ring-4 ring-white/50 transition hover:scale-[1.02] active:scale-95 ${c.bg}`}
          >
            <div className="dotted absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <span className="text-5xl drop-shadow-md transition group-hover:scale-110">
                {c.emoji}
              </span>
              <div>
                <h2 className="text-2xl font-extrabold drop-shadow-sm">
                  {c.title}
                </h2>
                <p className="mt-2 text-base font-semibold leading-snug text-white/95">
                  {c.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
