import { QuizGame } from "@/components/QuizGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navQuiz} — ${strings.siteTitle}`,
  description: "Kuis pilihan ganda arti nama surah Al-Qur'an.",
};

export default function QuizPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.navQuiz}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          Pilih arti yang benar. Kalau betul ada confetti, kalau salah ada bom!
        </p>
      </section>
      <QuizGame />
    </div>
  );
}
