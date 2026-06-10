import { ScopedGuessVersesGame } from "@/components/ScopedGuessVersesGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navGuess} — ${strings.siteTitle}`,
  description: "Tebak jumlah ayat dari surah pendek.",
};

export default function GuessPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navGuess}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          Tebak berapa jumlah ayat dari surah. Coba dari yang pendek dulu ya!
        </p>
      </section>
      <ScopedGuessVersesGame />
    </div>
  );
}
