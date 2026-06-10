"use client";

import { useMemo, useState } from "react";
import { SURAHS, type Surah } from "@/data/surahs";
import { JUZ30_NUMBERS } from "@/data/juz30";
import { strings } from "@/lib/strings";

export interface ScopePickerProps {
  /** Initial set of surah numbers selected. */
  initial: number[];
  /** Minimum number of surahs the user must select to confirm. */
  minimum: number;
  /** Optional whitelist — only surah numbers in this list are pickable. */
  availableNumbers?: number[];
  /** Explanation shown when the picker is whitelist-restricted. */
  restrictedNote?: string;
  /** Hide the cancel button (e.g. first-time picker). */
  hideCancel?: boolean;
  onConfirm: (selectedNumbers: number[]) => void;
  onCancel?: () => void;
}

const SHORT_LIMIT = 20;

export function SurahScopePicker({
  initial,
  minimum,
  availableNumbers,
  restrictedNote,
  hideCancel = false,
  onConfirm,
  onCancel,
}: ScopePickerProps) {
  const available = useMemo<Surah[]>(() => {
    if (!availableNumbers || !availableNumbers.length) return SURAHS;
    const allowed = new Set(availableNumbers);
    return SURAHS.filter((s) => allowed.has(s.number));
  }, [availableNumbers]);

  const availableSet = useMemo(
    () => new Set(available.map((s) => s.number)),
    [available],
  );

  const [selected, setSelected] = useState<Set<number>>(() => {
    const next = new Set<number>();
    for (const n of initial) {
      if (availableSet.has(n)) next.add(n);
    }
    return next;
  });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (s) =>
        String(s.number).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q),
    );
  }, [available, query]);

  const setAll = (numbers: number[]) => {
    setSelected(new Set(numbers.filter((n) => availableSet.has(n))));
  };

  const toggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const canConfirm = selected.size >= minimum;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={strings.scopePickerTitle}
    >
      <div className="pop-in flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-4 ring-pink-200">
        <header className="border-b-2 border-pink-100 bg-gradient-to-br from-pink-100 to-yellow-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-pink-700 sm:text-2xl">
                🎯 {strings.scopePickerTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold text-pink-900/80">
                {restrictedNote ?? strings.scopePickerSubtitle}
              </p>
            </div>
            {!hideCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 text-lg font-bold text-pink-700 shadow-sm transition hover:bg-white"
                aria-label={strings.scopeCancel}
              >
                ✕
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-pink-100 bg-pink-50/60 px-4 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={strings.scopeSearchPlaceholder}
            className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-900 shadow-inner ring-2 ring-pink-200 placeholder:text-pink-300 focus:outline-none focus:ring-pink-400"
          />
          <PresetButtons available={available} onPick={setAll} />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm font-bold text-pink-400">
              Tidak ada surah yang cocok.
            </p>
          )}
          {filtered.map((s) => {
            const checked = selected.has(s.number);
            return (
              <label
                key={s.number}
                className={`flex cursor-pointer items-center gap-2 rounded-2xl p-2 shadow-sm ring-2 transition active:scale-[0.99] ${
                  checked
                    ? "bg-pink-100 ring-pink-300"
                    : "bg-white ring-pink-100 hover:bg-pink-50 hover:ring-pink-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.number)}
                  className="h-5 w-5 shrink-0 accent-pink-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-pink-900">
                    {s.number}. {s.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-pink-700/70">
                    {s.meaning} • {s.verses} ayat
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <footer className="flex flex-col gap-2 border-t-2 border-pink-100 bg-pink-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-pink-800">
            <span
              className={
                canConfirm ? "text-emerald-600" : "text-pink-500"
              }
            >
              {selected.size}
            </span>{" "}
            {strings.scopeCount}
            {!canConfirm && (
              <span className="ml-2 text-xs font-semibold text-pink-500">
                ({strings.scopeMinHint.replace("{n}", String(minimum))})
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {!hideCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-pink-700 ring-2 ring-pink-200 transition hover:bg-pink-100"
              >
                {strings.scopeCancel}
              </button>
            )}
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() =>
                canConfirm &&
                onConfirm(Array.from(selected).sort((a, b) => a - b))
              }
              className="rounded-full bg-pink-500 px-6 py-2 text-sm font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-pink-200 disabled:text-pink-400"
            >
              {strings.scopeStart} →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PresetButtons({
  available,
  onPick,
}: {
  available: Surah[];
  onPick: (numbers: number[]) => void;
}) {
  const allNumbers = useMemo(() => available.map((s) => s.number), [available]);
  const juz30 = useMemo(
    () =>
      allNumbers.filter((n) => JUZ30_NUMBERS.includes(n)),
    [allNumbers],
  );
  const short = useMemo(
    () => available.filter((s) => s.verses <= SHORT_LIMIT).map((s) => s.number),
    [available],
  );
  // "Hafalan Awal" — the very first surahs kids typically memorize:
  // Al-Fatihah, An-Naas, Al-Falaq, Al-Ikhlas, Al-Lahab, An-Nasr, Al-Kafirun,
  // Al-Kausar, Al-Maun, Quraisy, Al-Fil.
  const earlyMemorization = useMemo(
    () =>
      [1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105].filter((n) =>
        allNumbers.includes(n),
      ),
    [allNumbers],
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {earlyMemorization.length > 0 && (
        <PresetChip onClick={() => onPick(earlyMemorization)} color="emerald">
          ⭐ {strings.scopePresetHafalan}
        </PresetChip>
      )}
      {juz30.length > 0 && (
        <PresetChip onClick={() => onPick(juz30)} color="violet">
          📖 {strings.scopePresetJuz30}
        </PresetChip>
      )}
      {short.length > 0 && (
        <PresetChip onClick={() => onPick(short)} color="sky">
          ✂️ {strings.scopePresetShort}
        </PresetChip>
      )}
      <PresetChip onClick={() => onPick(allNumbers)} color="pink">
        ✅ {strings.scopePresetAll}
      </PresetChip>
      <PresetChip onClick={() => onPick([])} color="gray">
        ✕ {strings.scopePresetNone}
      </PresetChip>
    </div>
  );
}

type ChipColor = "emerald" | "violet" | "sky" | "pink" | "gray";
const CHIP_STYLES: Record<ChipColor, string> = {
  emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200 hover:bg-emerald-200",
  violet: "bg-violet-100 text-violet-800 ring-violet-200 hover:bg-violet-200",
  sky: "bg-sky-100 text-sky-800 ring-sky-200 hover:bg-sky-200",
  pink: "bg-pink-100 text-pink-800 ring-pink-200 hover:bg-pink-200",
  gray: "bg-gray-100 text-gray-700 ring-gray-200 hover:bg-gray-200",
};

function PresetChip({
  onClick,
  color,
  children,
}: {
  onClick: () => void;
  color: ChipColor;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm ring-2 transition active:scale-95 ${CHIP_STYLES[color]}`}
    >
      {children}
    </button>
  );
}

export { SHORT_LIMIT };
