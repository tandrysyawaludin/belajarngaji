import { PageHeader } from "@/components/PageHeader";
import { ScopedBurgerGame } from "@/components/ScopedBurgerGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navBurger} — ${strings.siteTitle}`,
  description: strings.burgerPageDesc,
};

export default function BurgerPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        titleKey="navBurger"
        descriptionKey="burgerPageDesc"
        emoji="🍔"
      />
      <ScopedBurgerGame />
    </div>
  );
}
