import { PageHeader } from "@/components/PageHeader";
import { ScopedTicTacToeGame } from "@/components/ScopedTicTacToeGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navTtt} — ${strings.siteTitle}`,
  description: strings.tttPageDesc,
};

export default function TicTacToePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navTtt" descriptionKey="tttPageDesc" emoji="⭕" />
      <ScopedTicTacToeGame />
    </div>
  );
}
