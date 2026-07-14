import { PageHeader } from "@/components/PageHeader";
import { ScopedSambungAyatGame } from "@/components/ScopedSambungAyatGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navConnect} — ${strings.siteTitle}`,
  description:
    "Game sambung ayat: pilih ayat yang melanjutkan dari surah juz 30.",
};

export default function SambungPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navConnect" descriptionKey="connectPageDesc" />
      <ScopedSambungAyatGame />
    </div>
  );
}
