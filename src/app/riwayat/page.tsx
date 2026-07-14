import { PageHeader } from "@/components/PageHeader";
import { HistoryList } from "@/components/HistoryList";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.historyTitle} — ${strings.siteTitle}`,
  description: strings.historySubtitle,
};

export default function RiwayatPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="historyTitle" descriptionKey="historySubtitle" emoji="📊" />
      <HistoryList />
    </div>
  );
}
