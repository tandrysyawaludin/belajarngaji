import { SURAHS, type Surah } from "@/data/surahs";

// "Pick the surah first" scope for the new games (rescued from the old
// games' setup flow): the child chooses which surahs she has learned, and
// KidQuestion only asks about those, so questions stay inside her knowledge.
//
// Storage: localStorage key `belajarngaji:surah-scope` holds a JSON array of
// surah numbers. `null` (no key / invalid) means "all surahs" — no scoping.

export const STORAGE_KEY = "belajarngaji:surah-scope";

/** The SHORT question pool — identical to the one KidQuestion has always
 *  used: every surah from An-Nasr (103) onward, plus a few well-known ones. */
export const SHORT_SURAHS: Surah[] = SURAHS.filter(
  (s) => s.number >= 103 || [1, 36, 67, 78, 93, 97].includes(s.number),
);

export function getSurahScope(): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const nums = parsed
      .map((n) => (typeof n === "number" ? n : Number.parseInt(String(n), 10)))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
    const unique = Array.from(new Set(nums)).sort((a, b) => a - b);
    return unique.length ? unique : null;
  } catch {
    return null;
  }
}

export function setSurahScope(numbers: number[] | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!numbers || numbers.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const cleaned = Array.from(
      new Set(numbers.filter((n) => Number.isInteger(n) && n >= 1 && n <= 114)),
    ).sort((a, b) => a - b);
    if (cleaned.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    /* storage disabled — silently ignore */
  }
}

/** The surahs questions may be drawn from right now: the stored scope
 *  intersected with the SHORT pool. Falls back to the full SHORT pool when
 *  there is no scope or the intersection is empty. */
export function getScopedSurahs(): Surah[] {
  const scope = getSurahScope();
  if (!scope) return SHORT_SURAHS;
  const scoped = SHORT_SURAHS.filter((s) => scope.includes(s.number));
  return scoped.length ? scoped : SHORT_SURAHS;
}
