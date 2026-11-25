"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useStrings } from "@/components/LocaleProvider";
import {
  clearHistory,
  deleteEntry,
  readHistory,
  subscribeHistory,
  type HistoryEntry,
} from "@/lib/history";
import { ThemedMascot } from "./ThemedMascot";

// Surahs the kid hasn't actually played yet aren't really meaningful in the
// summary view — we'll dedupe and just show counts/colors per game.
const GAME_THEME: Record<HistoryEntry["gameId"], { bg: string; text: string; ring: string; emoji: string; href: string }> = {
  kuis: {
    bg: "bg-sky-yellow00",
    text: "text-sky-yellow00",
    ring: "ring-sky-yellow00",
    emoji: "⭐",
    href: "/kuis",
  },
  cocokkan: {
    bg: "bg-sky-emerald00",
    text: "text-sky-emerald00",
    ring: "ring-sky-emerald00",
    emoji: "🎯",
    href: "/cocokkan",
  },
  "tebak-ayat": {
    bg: "bg-sky-violet00",
    text: "text-sky-violet00",
    ring: "ring-sky-violet00",
    emoji: "🔢",
    href: "/tebak-ayat",
  },
  sambung: {
    bg: "bg-orange-100",
    text: "text-orange-900",
    ring: "ring-orange-200",
    emoji: "🔗",
    href: "/sambung",
  },
  "ular-tangga": {
    bg: "bg-sky-lime00",
    text: "text-sky-lime00",
    ring: "ring-sky-lime00",
    emoji: "🎲",
    href: "/ular-tangga",
  },
  berkebun: {
    bg: "bg-green-100",
    text: "text-green-900",
    ring: "ring-green-200",
    emoji: "🌾",
    href: "/berkebun",
  },
  "tukang-burger": {
    bg: "bg-sky-amber00",
    text: "text-sky-amber00",
    ring: "ring-sky-amber00",
    emoji: "🍔",
    href: "/tukang-burger",
  },
  "kotak-rahasia": {
    bg: "bg-sky-violet00",
    text: "text-sky-violet00",
    ring: "ring-sky-violet00",
    emoji: "💎",
    href: "/kotak-rahasia",
  },
  "tic-tac-toe": {
    bg: "bg-sky-100",
    text: "text-sky-900",
    ring: "ring-sky-200",
    emoji: "⭕",
    href: "/tic-tac-toe",
  },
};

const FALLBACK_THEME = {
  bg: "bg-slate-100",
  text: "text-slate-900",
  ring: "ring-slate-200",
  emoji: "🎮",
  href: "/games",
};

function useHistory(): HistoryEntry[] {
  const subscribe = useCallback(
    (cb: () => void) => subscribeHistory(cb),
    [],
  );
  const getSnapshot = useCallback(() => readHistory(), []);
  const getServerSnapshot = useCallback((): HistoryEntry[] => [], []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTimestamp(ts: number): string {
  try {
    return DATE_FMT.format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export function HistoryList() {
  const strings = useStrings();
  const entries = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (entries.length === 0) return null;
    const totals: Record<string, { played: number; right: number; total: number }> = {};
    for (const e of entries) {
      const k = e.gameId;
      const t = totals[k] ?? { played: 0, right: 0, total: 0 };
      t.played += 1;
      t.right += e.score;
      t.total += e.total;
      totals[k] = t;
    }
    return totals;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <article className="flex flex-col items-center gap-4 rounded-3xl bg-white/90 p-10 text-center shadow ring-2 ring-sky-pink00">
        <ThemedMascot size={120} mood="happy" />
        <p className="text-lg font-extrabold text-sky-pink00">
          {strings.historyEmpty}
        </p>
        <p className="text-sm font-semibold text-sky-pink00/80">
          {strings.historyEmptyHint}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {Object.entries(GAME_THEME).map(([id, t]) => (
            <Link
              key={id}
              href={t.href}
              className={`rounded-full px-4 py-2 text-sm font-extrabold shadow-sm ring-2 ${t.bg} ${t.text} ${t.ring} transition hover:brightness-95`}
            >
              {t.emoji} {strings.gameLabels[id as HistoryEntry["gameId"]]}
            </Link>
          ))}
        </div>
      </article>
    );
  }

  const handleClear = () => {
    if (typeof window !== "undefined" && !window.confirm(strings.historyClearConfirm)) {
      return;
    }
    clearHistory();
  };

  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(GAME_THEME) as Array<HistoryEntry["gameId"]>).map((id) => {
            const t = GAME_THEME[id];
            const s = summary[id];
            const pct = s && s.total ? Math.round((s.right / s.total) * 100) : 0;
            return (
              <div
                key={id}
                className={`rounded-2xl p-4 shadow ring-2 ${t.bg} ${t.text} ${t.ring}`}
              >
                <p className="text-sm font-bold opacity-80">
                  {t.emoji} {strings.gameLabels[id as HistoryEntry["gameId"]]}
                </p>
                {s ? (
                  <>
                    <p className="mt-1 text-2xl font-extrabold">
                      {s.right}
                      <span className="text-base opacity-70">/{s.total}</span>
                    </p>
                    <p className="text-xs font-semibold opacity-70">
                      {s.played} sesi • {pct}% benar
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs font-semibold opacity-60">
                    Belum dimainkan
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => {
          const t = GAME_THEME[entry.gameId] ?? FALLBACK_THEME;
          const open = openId === entry.id;
          const pct = entry.total ? Math.round((entry.score / entry.total) * 100) : 0;
          return (
            <li
              key={entry.id}
              className={`rounded-3xl bg-white/95 p-4 shadow ring-2 ${t.ring}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-sm ring-2 ${t.bg} ${t.text} ${t.ring}`}
                    aria-hidden="true"
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-base font-extrabold ${t.text}`}>
                      {strings.gameLabels[entry.gameId] ?? entry.gameLabel}
                    </p>
                    <p className="text-xs font-semibold text-sky-pink00/70">
                      {formatTimestamp(entry.timestamp)}
                      {entry.scopeNumbers && entry.scopeNumbers.length > 0 && (
                        <>
                          {" "}•{" "}
                          {strings.historyScopeNote.replace(
                            "{n}",
                            String(entry.scopeNumbers.length),
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sky-pink0 px-3 py-1.5 text-sm font-extrabold text-sky-pink00 ring-2 ring-sky-pink00">
                    {entry.score}/{entry.total}{" "}
                    <span className="text-xs font-bold text-sky-pink00">
                      ({pct}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : entry.id)}
                    className="rounded-full bg-sky-pink00 px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-sky-pink00 active:scale-95"
                    aria-expanded={open}
                  >
                    {open ? strings.historyDetailHide : strings.historyDetailToggle}
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-4 border-t border-sky-pink00 pt-4">
                  {entry.answers.length === 0 ? (
                    <p className="text-sm font-semibold text-sky-pink00/70">
                      Tidak ada detail jawaban.
                    </p>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {entry.answers.map((ans, i) => (
                        <li
                          key={i}
                          className={`rounded-2xl p-3 ring-2 ${
                            ans.correct
                              ? "bg-sky-emerald0 ring-sky-emerald00"
                              : "bg-red-50 ring-red-200"
                          }`}
                        >
                          <p className="flex items-start gap-2 text-sm font-extrabold">
                            <span
                              className={
                                ans.correct ? "text-sky-emerald00" : "text-red-700"
                              }
                              aria-hidden="true"
                            >
                              {ans.correct ? "✅" : "❌"}
                            </span>
                            <span className="text-sky-pink00">
                              {i + 1}. {ans.prompt}
                            </span>
                          </p>
                          <p className="mt-1 text-sm font-semibold text-sky-pink00/80">
                            <span className="text-sky-pink00">
                              {strings.historyYourAnswer}:{" "}
                            </span>
                            <span
                              className={
                                ans.correct
                                  ? "text-sky-emerald00"
                                  : "text-red-800 line-through decoration-2"
                              }
                            >
                              {ans.yourAnswer}
                            </span>
                          </p>
                          {!ans.correct && (
                            <p className="mt-0.5 text-sm font-semibold text-sky-emerald00">
                              <span className="text-sky-emerald00">
                                {strings.historyCorrectAnswer}:{" "}
                              </span>
                              {ans.correctAnswer}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-pink00 ring-2 ring-sky-pink00 transition hover:bg-sky-pink0 hover:text-sky-pink00"
                    >
                      Hapus catatan ini
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-sky-pink00 ring-2 ring-sky-pink00 transition hover:bg-sky-pink00"
        >
          🧹 {strings.historyClearAll}
        </button>
      </div>
    </div>
  );
}
