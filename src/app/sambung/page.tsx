import { SambungAyatGame } from "@/components/SambungAyatGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navConnect} — ${strings.siteTitle}`,
  description:
    "Game sambung ayat: pilih ayat yang melanjutkan dari surah juz 30.",
};

export default function SambungPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navConnect}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          Baca ayat di atas, lalu pilih ayat yang melanjutkan. Latih hafalan juz
          30 sambil bermain!
        </p>
      </section>
      <SambungAyatGame />
    </div>
  );
}
