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
  const [pickerOverride, setPickerOverride] = useState<boolean>(false);

  const filtered = useMemo<number[]>(() => {
    const source = override ?? stored ?? [];
    return allowedSet ? source.filter((n) => allowedSet.has(n)) : source;
  }, [override, stored, allowedSet]);

  const ready = filtered.length >= minimum;
  // The picker opens automatically when there's no usable scope yet, or when
  // the kid explicitly asks to change it.
  const pickerOpen = !ready || pickerOverride;

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
    setPickerOverride(false);
  };

  const handleCancel = () => {
    if (ready) setPickerOverride(false);
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
            onChange={() => setPickerOverride(true)}
          />
          {/* `key` on the wrapper forces the game to remount when the
              kid changes scope, giving a fresh session with no stale state. */}
          <div key={scopeKey}>{children(activeScope)}</div>
        </>
      ) : (
        <ScopePlaceholder />
      )}
      {pickerOpen && (
        <SurahScopePicker
          initial={initial}
          minimum={minimum}
          availableNumbers={availableNumbers}
          restrictedNote={restrictedNote}
          hideCancel={!ready}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

function ScopePlaceholder() {
  return (
    <div className="rounded-3xl bg-white/90 p-8 text-center shadow ring-2 ring-pink-100">
      <p className="text-base font-bold text-pink-500">
        🎯 Pilih surah dulu di kotak di atas yuk!
      </p>
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
