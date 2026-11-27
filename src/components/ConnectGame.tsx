"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";

/* Sambung Huruf Sama — a kid-simplified connect-pairs clone (cf. "Butterfly
   Kyodai 2" on games.co.id): tap one tile, tap another tile with the SAME
   hijaiyah letter, both pop away. No path rules — spotting pairs is the fun,
   and the letters are the learning. No token gate. */

const LETTERS: { arabic: string; name: string }[] = [
  { arabic: "ا", name: "Alif" },
  { arabic: "ب", name: "Ba" },
  { arabic: "ت", name: "Ta" },
  { arabic: "ث", name: "Tsa" },
  { arabic: "ج", name: "Jim" },
  { arabic: "ح", name: "Ha" },
  { arabic: "خ", name: "Kha" },
  { arabic: "د", name: "Dal" },
  { arabic: "ذ", name: "Dzal" },
  { arabic: "ر", name: "Ra" },
  { arabic: "ز", name: "Za" },
  { arabic: "س", name: "Sin" },
  { arabic: "ش", name: "Syin" },
  { arabic: "ص", name: "Shad" },
  { arabic: "ض", name: "Dhad" },
];

/* soft tile colour per letter index */
const TILE_COLORS = [
  "bg-sky-100 ring-sky-300 text-sky-800",
  "bg-pink-100 ring-pink-300 text-pink-800",
  "bg-amber-100 ring-amber-300 text-amber-800",
  "bg-teal-100 ring-teal-300 text-teal-800",
  "bg-violet-100 ring-violet-300 text-violet-800",
  "bg-lime-100 ring-lime-300 text-lime-800",
  "bg-cyan-100 ring-cyan-300 text-cyan-800",
  "bg-rose-100 ring-rose-300 text-rose-800",
  "bg-indigo-100 ring-indigo-300 text-indigo-800",
  "bg-emerald-100 ring-emerald-300 text-emerald-800",
  "bg-orange-100 ring-orange-300 text-orange-800",
  "bg-fuchsia-100 ring-fuchsia-300 text-fuchsia-800",
  "bg-blue-100 ring-blue-300 text-blue-800",
  "bg-yellow-100 ring-yellow-300 text-yellow-800",
  "bg-purple-100 ring-purple-300 text-purple-800",
];

const PAIRS = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBoard(): number[] {
  return shuffle(LETTERS.flatMap((_, i) => [i, i]));
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s} detik`;
}

export function ConnectGame() {
  const [board, setBoard] = useState<number[]>([]);
  const [cleared, setCleared] = useState<boolean[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [popped, setPopped] = useState<number[]>([]);
  const [shakePair, setShakePair] = useState<number[]>([]);
  const [status, setStatus] = useState("Ketuk satu ubin untuk mulai.");
  const [found, setFound] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const timer = useRef<number | null>(null);

  const stopTimer = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = () => {
    stopTimer();
    setBoard(makeBoard());
    setCleared(Array(PAIRS * 2).fill(false));
    setSel(null);
    setPopped([]);
    setShakePair([]);
    setStatus("Ketuk satu ubin untuk mulai.");
    setFound(0);
    setSeconds(0);
    setWon(false);
    timer.current = window.setInterval(() => setSeconds((v) => v + 1), 1000);
  };

  useEffect(() => {
    start();
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (idx: number) => {
    if (won || cleared[idx]) return;
    if (sel === null) {
      setSel(idx);
      setStatus(`Huruf ${LETTERS[board[idx]].name} dipilih — cari kembarannya!`);
      return;
    }
    if (sel === idx) {
      setSel(null);
      setStatus("Pilihan dibatalkan. Ketuk satu ubin untuk memilih huruf.");
      return;
    }
    if (board[sel] === board[idx]) {
      const next = [...cleared];
      next[sel] = true;
      next[idx] = true;
      setCleared(next);
      setPopped([sel, idx]);
      window.setTimeout(() => setPopped([]), 450);
      setSel(null);
      const nf = found + 1;
      setFound(nf);
      setStatus(
        nf === PAIRS
          ? "Semua pasangan ketemu!"
          : `Betul! Pasangan huruf ${LETTERS[board[idx]].name} ketemu! Masih ${PAIRS - nf} pasangan lagi.`,
      );
      if (nf === PAIRS) {
        setWon(true);
        stopTimer();
        confetti({
          particleCount: 220,
          spread: 130,
          origin: { y: 0.4 },
          colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#3FBFB2", "#ffffff"],
        });
      }
    } else {
      // Mismatch: shake BOTH tiles, explain, and clear the selection so the
      // next tap starts a fresh pick (never silently swap the selection).
      setShakePair([sel, idx]);
      window.setTimeout(() => setShakePair([]), 480);
      setStatus(
        `Itu huruf ${LETTERS[board[idx]].name}, bukan pasangan ${LETTERS[board[sel]].name}. Coba cari yang sama!`,
      );
      setSel(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0">
          <CloudPuppy size={64} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Sambung Huruf Sama</h1>
          <p className="text-base font-semibold text-sky-900/70">
            Ketuk dua ubin dengan huruf hijaiyah yang sama — keduanya hilang!
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-token">Pasangan: {found}/{PAIRS}</span>
        <span className="chip-token">Waktu: {fmt(seconds)}</span>
        <button
          type="button"
          className="btn-candy btn-candy-white ml-auto min-h-12 px-5"
          onClick={start}
        >
          Acak Ulang
        </button>
      </div>

      <div className="card-cloud mx-auto w-full max-w-[430px] p-1.5">
        <div className="grid grid-cols-6 gap-1">
          {board.map((letter, idx) => {
            const L = LETTERS[letter];
            if (cleared[idx] && !popped.includes(idx)) {
              return (
                <div
                  key={idx}
                  className="grid aspect-square place-items-center rounded-xl bg-sky-50/70 ring-1 ring-sky-100"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-30" aria-hidden="true">
                    <path
                      d="M12 3 a5 5 0 1 1 -2 9.6 A6 6 0 1 0 12 3Z"
                      fill="#7EC8F7"
                    />
                  </svg>
                </div>
              );
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => tap(idx)}
                aria-label={`Ubin huruf ${L.name}`}
                className={`grid aspect-square place-items-center rounded-xl shadow-sm ring-2 transition active:scale-95 ${TILE_COLORS[letter]} ${
                  sel === idx ? "z-10 scale-110 ring-4 ring-sky-500" : ""
                } ${shakePair.includes(idx) ? "shake-x" : ""} ${popped.includes(idx) ? "pop-place z-10 ring-amber-300" : ""}`}
              >
                <span
                  className="text-[26px] leading-none font-bold"
                  style={{ fontFamily: "var(--font-amiri), serif" }}
                >
                  {L.arabic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {won ? (
        <div className="card-cloud pop-place p-5 text-center">
          <p className="text-2xl font-extrabold text-sky-700">Masya Allah, papannya bersih!</p>
          <p className="mt-1 text-base font-semibold text-sky-900/70">
            Semua {PAIRS} pasangan hilang dalam {fmt(seconds)}.
          </p>
          <button type="button" className="btn-candy btn-candy-pink mt-4 min-h-12 px-6" onClick={start}>
            Main Lagi
          </button>
        </div>
      ) : (
        <p className="text-center text-base font-bold text-sky-700" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
