import { PageHeader } from "@/components/PageHeader";
import { ScopedFarmingGame } from "@/components/ScopedFarmingGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navFarming} — ${strings.siteTitle}`,
  description: strings.farmingPageDesc,
};

export default function FarmingPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titleKey="navFarming" descriptionKey="farmingPageDesc" emoji="🌾" />
      <ScopedFarmingGame />
    </div>
  );
}
