import { PageHeader } from "@/components/PageHeader";
import { ScopedMatchingGame } from "@/components/ScopedMatchingGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navMatch} — ${strings.siteTitle}`,
  description: "Game cocokkan nama surah dengan artinya.",
};

export default function MatchingPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navMatch" descriptionKey="matchPageDesc" />
      <ScopedMatchingGame />
    </div>
  );
}
