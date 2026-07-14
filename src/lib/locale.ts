import { isLocale, type Locale } from "./i18n";

const STORAGE_KEY = "belajarngaji:locale";
const COOKIE_KEY = "belajarngaji_locale";

let snapshot: { raw: string | null; value: Locale } | null = null;
const subscribers = new Set<() => void>();

function rawRead(): Locale {
  if (typeof window === "undefined") return "id";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "id";
}

export function readLocale(): Locale {
  const fresh = rawRead();
  if (snapshot && snapshot.raw === fresh) return snapshot.value;
  snapshot = { raw: fresh, value: fresh };
  return fresh;
}

export function writeLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = locale;
    snapshot = { raw: locale, value: locale };
    for (const cb of subscribers) cb();
  } catch {
    /* ignore */
  }
}

export function subscribeLocale(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export const LOCALE_BOOTSTRAP_SCRIPT = `(() => {
  try {
    var l = localStorage.getItem("${STORAGE_KEY}");
    if (l === "en" || l === "ja" || l === "id") document.documentElement.lang = l;
  } catch (_) {}
})();`;
