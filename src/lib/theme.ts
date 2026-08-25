// Active theme persistence. Two pieces of state:
//
//   localStorage["belajarngaji:theme"]   — the kid's chosen theme id (sticky)
//   sessionStorage["belajarngaji:theme:shown"] — "1" once she's seen the picker
//   in *this* browser session, so we know whether to show it on app open.
//
// We expose a tiny pub-sub so React's useSyncExternalStore can subscribe and
// React across tabs.

import { isThemeId, type ThemeDef } from "./themes";

const STORAGE_KEY = "belajarngaji:theme";
const SESSION_KEY = "belajarngaji:theme:shown";

let snapshot: { raw: string | null; value: string | null } | null = null;
const subscribers = new Set<() => void>();
const sessionSubscribers = new Set<() => void>();
// Survives ThemeProvider remounts when sessionStorage is blocked (embedded
// browsers / privacy mode). Without this, dismiss can look like a no-op.
let shownThisRuntime = false;

function rawReadId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isThemeId(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

export function readThemeId(): string | null {
  const fresh = rawReadId();
  if (snapshot && snapshot.raw === fresh) return snapshot.value;
  snapshot = { raw: fresh, value: fresh };
  return fresh;
}

export function writeThemeId(id: ThemeDef["id"]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
    snapshot = null;
    for (const cb of subscribers) cb();
  } catch {
    /* storage disabled — silently ignore */
  }
  markPickerShown();
}

export function hasShownPickerThisSession(): boolean {
  if (shownThisRuntime) return true;
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPickerShown(): void {
  shownThisRuntime = true;
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }
  } catch {
    /* storage disabled — in-memory flag still hides the picker */
  }
  for (const cb of sessionSubscribers) cb();
}

export function subscribeSessionShown(callback: () => void): () => void {
  sessionSubscribers.add(callback);
  return () => {
    sessionSubscribers.delete(callback);
  };
}

export function subscribeTheme(callback: () => void): () => void {
  subscribers.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      snapshot = null;
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/**
 * Synchronous bootstrap script that runs in <head> before paint to set
 * data-theme on <html>, preventing a flash of the wrong palette during
 * hydration. Returns a stringified IIFE for use with dangerouslySetInnerHTML.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    var t = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch (_) {}
})();`;
