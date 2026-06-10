import { HistoryList } from "@/components/HistoryList";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.historyTitle} — ${strings.siteTitle}`,
  description: strings.historySubtitle,
};

export default function RiwayatPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-gradient-to-br from-rose-100 via-pink-100 to-yellow-100 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-700 sm:text-3xl">
          📊 {strings.historyTitle}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          {strings.historySubtitle}
        </p>
      </section>
      <HistoryList />
    </div>
  );
}
