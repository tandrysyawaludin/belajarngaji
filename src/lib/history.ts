// Persistent score history in localStorage. Every completed game session is
// appended as a single entry containing the per-question breakdown so the kid
// (and her parent) can revisit what she got right and where she stumbled.

import type { GameId } from "./scope";

const STORAGE_KEY = "belajarngaji:history";
const MAX_ENTRIES = 100;

export interface HistoryAnswer {
  /** Human-readable prompt shown to the kid (e.g. "Surah Al-Fatihah artinya?") */
  prompt: string;
  /** What the kid chose / typed. */
  yourAnswer: string;
  /** The correct value she should have picked. */
  correctAnswer: string;
  /** True if her answer was correct. */
  correct: boolean;
}

export interface HistoryEntry {
  id: string;
  gameId: GameId;
  gameLabel: string;
  /** Unix ms timestamp the session finished. */
  timestamp: number;
  /** How many questions she got right. */
  score: number;
  /** Total questions / matches in the session. */
  total: number;
  /** Snapshot of the surah numbers that were eligible during the session. */
  scopeNumbers?: number[];
  answers: HistoryAnswer[];
}

export const GAME_LABELS: Record<GameId, string> = {
  kuis: "Kuis Arti",
  cocokkan: "Cocokkan",
  "tebak-ayat": "Tebak Jumlah Ayat",
  sambung: "Sambung Ayat",
};

export function gameLabel(gameId: GameId): string {
  return GAME_LABELS[gameId];
}

// Stable-snapshot cache for useSyncExternalStore. We must hand back the same
// array reference when the underlying JSON is unchanged or React will loop.
let snapshot: { json: string; value: HistoryEntry[] } | null = null;
const subscribers = new Set<() => void>();

function rawRead(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.gameId === "string" &&
    typeof e.gameLabel === "string" &&
    typeof e.timestamp === "number" &&
    typeof e.score === "number" &&
    typeof e.total === "number" &&
    Array.isArray(e.answers)
  );
}

export function readHistory(): HistoryEntry[] {
  const fresh = rawRead();
  const json = JSON.stringify(fresh);
  if (snapshot && snapshot.json === json) return snapshot.value;
  snapshot = { json, value: fresh };
  return fresh;
}

function writeRaw(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    snapshot = null;
    for (const cb of subscribers) cb();
  } catch {
    /* storage disabled — silently ignore */
  }
}

function newId(): string {
  const cryptoObj =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof (globalThis.crypto as Crypto | undefined)?.randomUUID === "function"
      ? globalThis.crypto
      : null;
  if (cryptoObj) return cryptoObj.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface AddEntryInput {
  gameId: GameId;
  score: number;
  total: number;
  answers: HistoryAnswer[];
  scopeNumbers?: number[];
}

export function addEntry(input: AddEntryInput): HistoryEntry {
  const entry: HistoryEntry = {
    id: newId(),
    gameId: input.gameId,
    gameLabel: gameLabel(input.gameId),
    timestamp: Date.now(),
    score: input.score,
    total: input.total,
    scopeNumbers: input.scopeNumbers,
    answers: input.answers,
  };
  // Sort newest first and cap so localStorage doesn't bloat.
  const next = [entry, ...rawRead()].slice(0, MAX_ENTRIES);
  writeRaw(next);
  return entry;
}

export function clearHistory(): void {
  writeRaw([]);
}

export function deleteEntry(id: string): void {
  writeRaw(rawRead().filter((e) => e.id !== id));
}

export function subscribeHistory(callback: () => void): () => void {
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
