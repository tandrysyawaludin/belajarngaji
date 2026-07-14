"use client";

import type { StringKey, Strings } from "@/lib/i18n";
import { useStrings } from "./LocaleProvider";

type TextKey = {
  [K in StringKey]: Strings[K] extends string ? K : never;
}[StringKey];

export function PageHeader({
  titleKey,
  descriptionKey,
  emoji,
}: {
  titleKey: TextKey;
  descriptionKey?: TextKey;
  emoji?: string;
}) {
  const strings = useStrings();
  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
      <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
        {emoji ? `${emoji} ` : ""}
        {strings[titleKey]}
      </h1>
      {descriptionKey && (
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          {strings[descriptionKey]}
        </p>
      )}
    </section>
  );
}
