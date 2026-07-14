"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  formatString,
  getStrings,
  LOCALE_LABELS,
  type Locale,
  type Strings,
} from "@/lib/i18n";
import { readLocale, subscribeLocale, writeLocale } from "@/lib/locale";

interface LocaleContextValue {
  locale: Locale;
  strings: Strings;
  setLocale: (locale: Locale) => void;
  format: (template: string, vars: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function useStoredLocale(): Locale {
  const subscribe = useCallback((cb: () => void) => subscribeLocale(cb), []);
  const getSnapshot = useCallback(() => readLocale(), []);
  const getServerSnapshot = useCallback((): Locale => "id", []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useStoredLocale();
  const strings = useMemo(() => getStrings(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);

  const format = useCallback(
    (template: string, vars: Record<string, string | number>) =>
      formatString(template, vars),
    [],
  );

  const value = useMemo(
    () => ({ locale, strings, setLocale, format }),
    [locale, strings, setLocale, format],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useStrings(): Strings {
  const ctx = useContext(LocaleContext);
  if (!ctx) return getStrings("id");
  return ctx.strings;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "id" as Locale,
      setLocale: () => {},
      labels: LOCALE_LABELS,
    };
  }
  return { locale: ctx.locale, setLocale: ctx.setLocale, labels: LOCALE_LABELS };
}

export function useFormat() {
  const ctx = useContext(LocaleContext);
  return ctx?.format ?? formatString;
}
