import Link from "next/link";
import { GAME_CARDS } from "@/lib/games";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navGames} — ${strings.siteTitle}`,
  description: strings.cardGamesDesc,
};

export default function GamesPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navGames}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          {strings.gamesIntro}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAME_CARDS.map((c) => (
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
                <h2 className="text-2xl font-extrabold drop-shadow-sm">{c.title}</h2>
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
