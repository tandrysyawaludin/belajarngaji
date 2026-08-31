import { PageHeader } from "@/components/PageHeader";
import { ScopedKotakRahasiaGame } from "@/components/ScopedKotakRahasiaGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navKotak} — ${strings.siteTitle}`,
  description: strings.kotakPageDesc,
};

export default function KotakRahasiaPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        titleKey="navKotak"
        descriptionKey="kotakPageDesc"
        emoji="💎"
      />
      <ScopedKotakRahasiaGame />
    </div>
  );
}
