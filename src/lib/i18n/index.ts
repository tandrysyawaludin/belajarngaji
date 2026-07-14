import { en } from "./en";
import { id } from "./id";
import { ja } from "./ja";
import type { Strings } from "./types";

export type Locale = "id" | "en" | "ja";

export const LOCALES: readonly Locale[] = ["id", "en", "ja"];

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "ID",
  en: "EN",
  ja: "JA",
};

const MESSAGES: Record<Locale, Strings> = { id, en, ja };

export function getStrings(locale: Locale): Strings {
  return MESSAGES[locale] ?? id;
}

export function isLocale(value: string): value is Locale {
  return value === "id" || value === "en" || value === "ja";
}

export function formatString(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`),
  );
}

export type { Strings, StringKey } from "./types";
