"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import { useLocale, useStrings } from "./LocaleProvider";

export function LanguageBadge() {
  const { locale, setLocale } = useLocale();
  const strings = useStrings();

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-sm ring-2 ring-pink-100"
      role="group"
      aria-label={strings.navLanguage}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code as Locale)}
          className={`rounded-full px-2.5 py-1 text-xs font-extrabold transition active:scale-95 ${
            locale === code
              ? "bg-pink-500 text-white shadow"
              : "text-pink-700 hover:bg-pink-100"
          }`}
          aria-pressed={locale === code}
          aria-label={LOCALE_LABELS[code]}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
