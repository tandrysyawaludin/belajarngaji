// Per-game scope persistence in localStorage. Stores the list of surah numbers
// the kid is allowed to be quizzed on. Saving lets her keep her chosen "learned
// so far" list across visits without re-selecting every time.

export type GameId =
  | "kuis"
  | "cocokkan"
  | "tebak-ayat"
  | "sambung"
  | "ular-tangga"
  | "berkebun"
  | "tukang-burger"
  | "kotak-rahasia"
  | "tic-tac-toe";

const STORAGE_PREFIX = "belajarngaji:scope:";

function key(gameId: GameId): string {
  return `${STORAGE_PREFIX}${gameId}`;
}

// Cache of last-returned arrays per gameId so useSyncExternalStore gets a
// stable reference when the underlying JSON hasn't changed. Without this React
// would re-render on every snapshot call.
interface SnapshotCacheEntry {
  json: string;
  value: number[] | null;
}
const snapshotCache = new Map<GameId, SnapshotCacheEntry>();
const subscribers = new Map<GameId, Set<() => void>>();

function rawRead(gameId: GameId): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(gameId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const nums = parsed
      .map((n) => (typeof n === "number" ? n : Number.parseInt(String(n), 10)))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
    return nums.length ? Array.from(new Set(nums)).sort((a, b) => a - b) : null;
  } catch {
    return null;
  }
}

export function readScope(gameId: GameId): number[] | null {
  const fresh = rawRead(gameId);
  const json = JSON.stringify(fresh);
  const cached = snapshotCache.get(gameId);
  if (cached && cached.json === json) return cached.value;
  snapshotCache.set(gameId, { json, value: fresh });
  return fresh;
}

export function writeScope(gameId: GameId, surahNumbers: number[]): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = Array.from(
      new Set(surahNumbers.filter((n) => Number.isInteger(n) && n >= 1 && n <= 114)),
    ).sort((a, b) => a - b);
    window.localStorage.setItem(key(gameId), JSON.stringify(cleaned));
    snapshotCache.delete(gameId);
    for (const cb of subscribers.get(gameId) ?? []) cb();
  } catch {
    /* storage disabled — silently ignore */
  }
}

export function clearScope(gameId: GameId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(gameId));
    snapshotCache.delete(gameId);
    for (const cb of subscribers.get(gameId) ?? []) cb();
  } catch {
    /* ignore */
  }
}

// Subscribe to scope changes — both same-tab (via writeScope) and cross-tab
// (via the `storage` event). Returns an unsubscribe function.
export function subscribeScope(gameId: GameId, callback: () => void): () => void {
  let set = subscribers.get(gameId);
  if (!set) {
    set = new Set();
    subscribers.set(gameId, set);
  }
  set.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key(gameId)) {
      snapshotCache.delete(gameId);
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    set?.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}
