"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { SURAHS, type Surah } from "@/data/surahs";
import {
  readScope,
  writeScope,
  subscribeScope,
  type GameId,
} from "@/lib/scope";
import { strings } from "@/lib/strings";
import { SurahScopePicker } from "./SurahScopePicker";

interface ScopedGameProps {
  gameId: GameId;
  minimum: number;
  availableNumbers?: number[];
  restrictedNote?: string;
  /** Default scope used if the kid has never picked before. */
  defaultScope?: number[];
  /** Render-prop: gets the active scope (filtered to available surah objects). */
  children: (scope: Surah[]) => React.ReactNode;
}

function useStoredScope(gameId: GameId): number[] | null {
  const subscribe = useCallback(
    (cb: () => void) => subscribeScope(gameId, cb),
    [gameId],
  );
  const getSnapshot = useCallback(() => readScope(gameId), [gameId]);
  const getServerSnapshot = useCallback((): number[] | null => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ScopedGame({
  gameId,
  minimum,
  availableNumbers,
  restrictedNote,
  defaultScope,
  children,
}: ScopedGameProps) {
  const allowedSet = useMemo(
    () => (availableNumbers ? new Set(availableNumbers) : null),
    [availableNumbers],
  );

  const stored = useStoredScope(gameId);
  // Track an in-memory override so confirming the picker doesn't race the
  // localStorage write/read round-trip.
  const [override, setOverride] = useState<number[] | null>(null);
  // Tri-state picker visibility:
  //   null  = "auto" — open if scope isn't ready yet (first visit)
  //   true  = explicitly opened by kid via the Ganti Pilihan button
  //   false = explicitly dismissed by the close button
  const [pickerVisible, setPickerVisible] = useState<boolean | null>(null);

  const filtered = useMemo<number[]>(() => {
    const source = override ?? stored ?? [];
    return allowedSet ? source.filter((n) => allowedSet.has(n)) : source;
  }, [override, stored, allowedSet]);

  const ready = filtered.length >= minimum;
  const pickerOpen =
    pickerVisible === true || (pickerVisible === null && !ready);

  const activeScope = useMemo<Surah[]>(
    () =>
      ready ? SURAHS.filter((s) => filtered.includes(s.number)) : [],
    [ready, filtered],
  );

  const scopeKey = filtered.join(",");

  const handleConfirm = (numbers: number[]) => {
    const cleaned = allowedSet ? numbers.filter((n) => allowedSet.has(n)) : numbers;
    writeScope(gameId, cleaned);
    setOverride(cleaned);
    setPickerVisible(false);
  };

  const handleCancel = () => {
    setPickerVisible(false);
  };

  const initial = filtered.length
    ? filtered
    : defaultScope
      ? allowedSet
        ? defaultScope.filter((n) => allowedSet.has(n))
        : defaultScope
      : [];

  return (
    <>
      {ready ? (
        <>
          <ScopeBadge
            scope={activeScope}
            onChange={() => setPickerVisible(true)}
          />
          {/* `key` on the wrapper forces the game to remount when the
              kid changes scope, giving a fresh session with no stale state. */}
          <div key={scopeKey}>{children(activeScope)}</div>
        </>
      ) : (
        <ScopePlaceholder onPick={() => setPickerVisible(true)} />
      )}
      {pickerOpen && (
        <SurahScopePicker
          initial={initial}
          minimum={minimum}
          availableNumbers={availableNumbers}
          restrictedNote={restrictedNote}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

function ScopePlaceholder({ onPick }: { onPick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/90 p-8 text-center shadow ring-2 ring-pink-100">
      <p className="text-base font-bold text-pink-500">
        🎯 Pilih surah dulu yuk untuk mulai bermain!
      </p>
      <button
        type="button"
        onClick={onPick}
        className="rounded-full bg-pink-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
      >
        🎯 {strings.scopePickerTitle}
      </button>
    </div>
  );
}

function ScopeBadge({
  scope,
  onChange,
}: {
  scope: Surah[];
  onChange: () => void;
}) {
  const preview = scope
    .slice(0, 3)
    .map((s) => s.name)
    .join(", ");
  const extra = scope.length > 3 ? ` +${scope.length - 3}` : "";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/85 px-4 py-2 text-sm font-bold text-pink-800 shadow ring-2 ring-pink-100">
      <p className="min-w-0 truncate">
        🎯 {scope.length} surah:{" "}
        <span className="font-semibold text-pink-700/80">
          {preview}
          {extra}
        </span>
      </p>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-full bg-pink-100 px-3 py-1.5 text-xs font-extrabold text-pink-700 ring-2 ring-pink-200 transition hover:bg-pink-200"
      >
        🔄 {strings.scopeChange}
      </button>
    </div>
  );
}
