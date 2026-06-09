import { MatchingGame } from "@/components/MatchingGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navMatch} — ${strings.siteTitle}`,
  description: "Game cocokkan nama surah dengan artinya.",
};

export default function MatchingPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navMatch}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          Pilih nama surah di kiri, lalu pilih arti yang cocok di kanan!
        </p>
      </section>
      <MatchingGame />
    </div>
  );
}
