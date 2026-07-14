import { PageHeader } from "@/components/PageHeader";
import { ScopedQuizGame } from "@/components/ScopedQuizGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navQuiz} — ${strings.siteTitle}`,
  description: "Kuis pilihan ganda arti nama surah Al-Qur'an.",
};

export default function QuizPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navQuiz" descriptionKey="quizPageDesc" />
      <ScopedQuizGame />
    </div>
  );
}
