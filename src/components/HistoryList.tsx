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
import { CloudPuppy } from "./CloudPuppy";

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

  const totals = useMemo(() => {
    if (entries.length === 0) return null;
    let right = 0;
    let total = 0;
    for (const e of entries) {
      right += e.score;
      total += e.total;
    }
    return { sessions: entries.length, right, total };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <article className="flex flex-col items-center gap-4 rounded-3xl bg-white/90 p-10 text-center shadow ring-2 ring-sky-200">
        <span className="floaty flex h-32 w-32 items-center justify-center rounded-full bg-sky-100 shadow-inner ring-4 ring-white">
          <CloudPuppy size={110} />
        </span>
        <p className="text-lg font-extrabold text-sky-700">
          {strings.historyEmpty}
        </p>
        <p className="text-sm font-semibold text-sky-900/80">
          {strings.historyEmptyHint}
        </p>
        <Link
          href="/games"
          className="mt-2 rounded-full bg-sky-100 px-5 py-2.5 text-sm font-extrabold text-sky-700 shadow-sm ring-2 ring-sky-200 transition hover:brightness-95"
        >
          🎮 {strings.navGames}
        </Link>
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
      {totals && (
        <section className="rounded-2xl bg-sky-100 p-4 text-sky-700 shadow ring-2 ring-sky-200">
          <p className="text-sm font-bold opacity-80">📊 Total bermain</p>
          <p className="mt-1 text-2xl font-extrabold">
            {totals.right}
            <span className="text-base opacity-70">/{totals.total} benar</span>
          </p>
          <p className="text-xs font-semibold opacity-70">
            {totals.sessions} sesi permainan
          </p>
        </section>
      )}

      <ul className="flex flex-col gap-3">
        {entries.map((entry) => {
          const open = openId === entry.id;
          const pct = entry.total ? Math.round((entry.score / entry.total) * 100) : 0;
          return (
            <li
              key={entry.id}
              className="rounded-3xl bg-white/95 p-4 shadow ring-2 ring-sky-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-2xl shadow-sm ring-2 ring-sky-200"
                    aria-hidden="true"
                  >
                    🎮
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-sky-700">
                      {entry.gameLabel}
                    </p>
                    <p className="text-xs font-semibold text-sky-900/70">
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
                  <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-extrabold text-sky-700 ring-2 ring-sky-200">
                    {entry.score}/{entry.total}{" "}
                    <span className="text-xs font-bold text-sky-700">
                      ({pct}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : entry.id)}
                    className="rounded-full bg-sky-100 px-4 py-1.5 text-xs font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-200 active:scale-95"
                    aria-expanded={open}
                  >
                    {open ? strings.historyDetailHide : strings.historyDetailToggle}
                  </button>
                </div>
              </div>

              {open && (
                <div className="mt-4 border-t border-sky-200 pt-4">
                  {entry.answers.length === 0 ? (
                    <p className="text-sm font-semibold text-sky-900/70">
                      Tidak ada detail jawaban.
                    </p>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {entry.answers.map((ans, i) => (
                        <li
                          key={i}
                          className={`rounded-2xl p-3 ring-2 ${
                            ans.correct
                              ? "bg-sky-100 ring-sky-200"
                              : "bg-red-50 ring-red-200"
                          }`}
                        >
                          <p className="flex items-start gap-2 text-sm font-extrabold">
                            <span
                              className={
                                ans.correct ? "text-sky-700" : "text-red-700"
                              }
                              aria-hidden="true"
                            >
                              {ans.correct ? "✅" : "❌"}
                            </span>
                            <span className="text-sky-700">
                              {i + 1}. {ans.prompt}
                            </span>
                          </p>
                          <p className="mt-1 text-sm font-semibold text-sky-900/80">
                            <span className="text-sky-700">
                              {strings.historyYourAnswer}:{" "}
                            </span>
                            <span
                              className={
                                ans.correct
                                  ? "text-sky-700"
                                  : "text-red-800 line-through decoration-2"
                              }
                            >
                              {ans.yourAnswer}
                            </span>
                          </p>
                          {!ans.correct && (
                            <p className="mt-0.5 text-sm font-semibold text-sky-700">
                              <span className="text-sky-700">
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
                      className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700 ring-2 ring-sky-200 transition hover:bg-sky-100 hover:text-sky-700"
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
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-sky-700 ring-2 ring-sky-200 transition hover:bg-sky-100"
        >
          🧹 {strings.historyClearAll}
        </button>
      </div>
    </div>
  );
}
