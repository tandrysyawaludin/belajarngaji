import { PageHeader } from "@/components/PageHeader";
import { ScopedGuessVersesGame } from "@/components/ScopedGuessVersesGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navGuess} — ${strings.siteTitle}`,
  description: "Tebak jumlah ayat dari surah pendek.",
};

export default function GuessPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navGuess" descriptionKey="guessPageDesc" />
      <ScopedGuessVersesGame />
    </div>
  );
}
