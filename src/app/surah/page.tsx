import Link from "next/link";
import { ContinueReading } from "@/components/ContinueReading";
import { SURAHS } from "@/data/surahs";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navSurah} — ${strings.siteTitle}`,
  description: "Baca 114 surah dalam Al-Qur'an.",
};

const SURAHS_DESC = [...SURAHS].reverse();

const PALETTES = [
  "from-pink-200 to-rose-200 text-rose-900 ring-rose-200",
  "from-sky-200 to-blue-200 text-blue-900 ring-blue-200",
  "from-yellow-200 to-amber-200 text-amber-900 ring-amber-200",
  "from-emerald-200 to-teal-200 text-emerald-900 ring-emerald-200",
  "from-violet-200 to-fuchsia-200 text-fuchsia-900 ring-fuchsia-200",
  "from-orange-200 to-pink-200 text-orange-900 ring-orange-200",
];

export default function SurahListPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navSurah}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          Pilih salah satu surah untuk membacanya 📖
        </p>
      </section>

      <ContinueReading />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SURAHS_DESC.map((s) => {
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
                {s.meaning} • {s.verses} ayat
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
