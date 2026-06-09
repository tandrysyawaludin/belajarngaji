// Thin wrapper around fawazahmed0/quran-api, served via jsDelivr.
// Docs: https://github.com/fawazahmed0/quran-api

const PRIMARY = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";
// Some networks block jsDelivr; the README also recommends a statically.io fallback.
const FALLBACK = "https://cdn.statically.io/gh/fawazahmed0/quran-api/1";

// Standard Uthmani (Hafs) text from Quran Academy. Renders cleanly in widely
// available fonts (Amiri, Noto Naskh Arabic). The Indopak edition
// (`ara-quranindopak`) was avoided because it relies on Arabic Extended-A
// codepoints (U+08E2, U+08F0–08F2) that most fonts don't ship glyphs for,
// producing "tofu" squares.
export const ARABIC_EDITION = "ara-quranacademy";
export const INDONESIAN_EDITION = "ind-indonesianislam";

export interface ApiVerse {
  chapter: number;
  verse: number;
  text: string;
}

interface ApiChapterResponse {
  chapter: ApiVerse[];
}

async function fetchEdition(edition: string, chapter: number): Promise<ApiVerse[]> {
  const path = `editions/${edition}/${chapter}.min.json`;
  const urls = [`${PRIMARY}/${path}`, `${FALLBACK}/${path}`];
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        // Cache aggressively at the edge — the source data never changes.
        next: { revalidate: 60 * 60 * 24 * 30 },
      });
      if (!res.ok) {
        lastError = new Error(`upstream ${res.status} for ${url}`);
        continue;
      }
      const data = (await res.json()) as ApiChapterResponse;
      if (!data?.chapter?.length) {
        lastError = new Error(`empty chapter for ${url}`);
        continue;
      }
      return data.chapter;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("quran fetch failed");
}

export interface MergedVerse {
  verse: number;
  arabic: string;
  translation: string;
}

export async function fetchSurahWithTranslation(chapter: number): Promise<MergedVerse[]> {
  const [arabic, indonesian] = await Promise.all([
    fetchEdition(ARABIC_EDITION, chapter),
    fetchEdition(INDONESIAN_EDITION, chapter),
  ]);
  const indMap = new Map(indonesian.map((v) => [v.verse, v.text]));
  return arabic.map((a) => ({
    verse: a.verse,
    arabic: a.text,
    translation: indMap.get(a.verse) ?? "",
  }));
}

// URL of the full-surah recitation by Mishary Rashid Alafasy, hosted on
// the public mp3quran.net CDN. Reciter is well-known for clear, child-friendly
// recitation.
export function recitationUrl(chapter: number): string {
  const padded = String(chapter).padStart(3, "0");
  return `https://server8.mp3quran.net/afs/${padded}.mp3`;
}
