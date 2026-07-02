const STORAGE_KEY = "belajarngaji:quran-bookmark";

export interface QuranBookmark {
  surahNumber: number;
  verse: number;
  updatedAt: number;
}

let snapshot: { raw: string | null; value: QuranBookmark | null } | null = null;
const subscribers = new Set<() => void>();

function parse(raw: string | null): QuranBookmark | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      typeof data === "object" &&
      data !== null &&
      typeof (data as QuranBookmark).surahNumber === "number" &&
      typeof (data as QuranBookmark).verse === "number"
    ) {
      return data as QuranBookmark;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function rawRead(): QuranBookmark | null {
  if (typeof window === "undefined") return null;
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function readBookmark(): QuranBookmark | null {
  const fresh = rawRead();
  const raw = fresh ? JSON.stringify(fresh) : null;
  if (snapshot && snapshot.raw === raw) return snapshot.value;
  snapshot = { raw, value: fresh };
  return fresh;
}

export function writeBookmark(bookmark: QuranBookmark): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmark));
    snapshot = { raw: JSON.stringify(bookmark), value: bookmark };
    subscribers.forEach((cb) => cb());
  } catch {
    /* ignore */
  }
}

export function subscribeBookmark(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
