import { PageHeader } from "@/components/PageHeader";
import { ScopedSnakeLadderGame } from "@/components/ScopedSnakeLadderGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navSnakeLadder} — ${strings.siteTitle}`,
  description: "Game ular tangga Al-Qur'an dengan soal acak di setiap kotak.",
};

export default function SnakeLadderPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navSnakeLadder" descriptionKey="snakePageDesc" />
      <ScopedSnakeLadderGame />
    </div>
  );
}
