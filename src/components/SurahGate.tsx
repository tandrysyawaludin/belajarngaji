"use client";

import { useEffect, useState } from "react";
import { CloudPuppy } from "@/components/CloudPuppy";
import {
  SHORT_SURAHS,
  getSurahScope,
  setSurahScope,
} from "@/lib/surahScope";

// Set once the child (or parent) has confirmed a surah pick at least once.
// Needed because "Semua Surah" is stored as a null scope — without this
// marker the gate couldn't tell "chose Semua" from "never chose".
const DECIDED_KEY = "belajarngaji:surah-scope:decided";

interface SurahGateProps {
  gameId: string;
}

/**
 * "Pilih surah dulu" gate, rescued from the old games: before playing, the
 * child picks the surahs she has already learned, and KidQuestion only asks
 * about those (see lib/surahScope). Auto-opens once when nothing is stored
 * yet — but waits until the game's first-visit GameGuide overlay has been
 * dismissed so the two never stack. Afterwards it lives as a small inline
 * chip ("📖 Surah: … • Ganti") that reopens the picker anytime.
 */
export function SurahGate({ gameId }: SurahGateProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scope, setScope] = useState<number[] | null>(null);
  const [hasChosen, setHasChosen] = useState(false);
  const [allMode, setAllMode] = useState(true);
  const [picked, setPicked] = useState<number[]>([]);

  // Initial load: decide whether the gate needs to introduce itself.
  useEffect(() => {
    const stored = getSurahScope();
    setScope(stored);
    let decided = false;
    try {
      decided = !!window.localStorage.getItem(DECIDED_KEY);
    } catch {
      decided = false;
    }
    setHasChosen(!!stored || decided);
    setLoaded(true);
    if (stored || decided) return;

    // Nothing chosen yet — but the GameGuide overlay goes first. Poll until
    // its seen-flag exists, then open.
    const guideKey = `belajarngaji:guide:${gameId}`;
    const timer = window.setInterval(() => {
      let guideSeen = false;
      try {
        guideSeen = !!window.localStorage.getItem(guideKey);
      } catch {
        guideSeen = true;
      }
      if (guideSeen) {
        window.clearInterval(timer);
        setOpen(true);
      }
    }, 600);
    return () => window.clearInterval(timer);
  }, [gameId]);

  // Keep the game still behind the overlay.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open ]);

  const openPicker = () => {
    setAllMode(scope === null);
    setPicked(scope ?? []);
    setOpen(true);
  };

  const toggleSurah = (n: number) => {
    setAllMode(false);
    setPicked((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );
  };

  const confirm = () => {
    const next = allMode ? null : [...picked].sort((a, b) => a - b);
    setSurahScope(next);
    try {
      window.localStorage.setItem(DECIDED_KEY, "1");
    } catch {
      /* ignore */
    }
    setScope(next);
    setHasChosen(true);
    setOpen(false);
  };

  const summary = (() => {
    if (!scope || scope.length === 0) return "Semua";
    const first = SHORT_SURAHS.find((s) => s.number === scope[0]);
    const name = first ? first.name : `Surah ${scope[0]}`;
    return scope.length > 1 ? `${name} +${scope.length - 1}` : name;
  })();

  const canConfirm = allMode || picked.length >= 1;

  return (
    <>
      {/* Inline reopen chip — sits in the page flow, never floats over play. */}
      {loaded && !open && (
        <div>
          <button
            type="button"
            onClick={openPicker}
            aria-label="Ganti pilihan surah"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-sky-200 bg-white/85 px-4 py-2 text-sm font-extrabold text-sky-700 shadow-sm transition active:scale-95"
          >
            📖 Surah: {summary} • Ganti
          </button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-sky-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih surah dulu"
        >
          <div className="card-cloud relative max-h-full w-full max-w-sm overflow-y-auto rounded-3xl p-5">
            {hasChosen && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup pilihan surah"
                className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg font-extrabold text-sky-700 transition active:scale-90"
              >
                ✕
              </button>
            )}

            <div className="flex flex-col items-center text-center">
              <span className="floaty flex h-28 w-28 items-center justify-center rounded-full bg-sky-100 shadow-inner ring-4 ring-white">
                <CloudPuppy size={92} />
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-sky-700">
                Pilih Surah Dulu Yuk! 📖
              </h2>
              <p className="mt-1 text-base font-bold text-sky-900/70">
                Pilih surah yang sudah kamu hafal. Soalnya dari surah itu saja.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAllMode(true)}
              aria-pressed={allMode}
              className={`mt-4 min-h-12 w-full rounded-full px-5 py-2.5 text-lg font-extrabold shadow transition active:scale-95 ${
                allMode
                  ? "bg-gradient-to-r from-sky-400 to-pink-400 text-white"
                  : "bg-sky-100 text-sky-900 hover:bg-sky-200"
              }`}
            >
              🌟 Semua Surah
            </button>

            <div className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {SHORT_SURAHS.map((s) => {
                const active = !allMode && picked.includes(s.number);
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => toggleSurah(s.number)}
                    aria-pressed={active}
                    className={`min-h-11 rounded-full px-3 py-2 text-sm font-extrabold shadow-sm transition active:scale-95 ${
                      active
                        ? "bg-pink-400 text-white"
                        : "bg-sky-100 text-sky-900 hover:bg-sky-200"
                    }`}
                  >
                    {s.name} • {s.verses} ayat
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirm}
              disabled={!canConfirm}
              className="btn-candy btn-candy-pink mt-5 min-h-14 w-full px-6 text-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              ▶ Mulai Main!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
