"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { GameGuide } from "@/components/GameGuide";
import { HIJAIYAH } from "@/components/KidQuestion";

/* Kartu Pasangan Hijaiyah — a memory-pairs clone (cf. "Pasangan Lucu
   Anak-Anak" on games.co.id): one simple action, tap a cloud card to flip
   it. The letters themselves are the learning — no token gate. */

const LETTERS = [
  ...HIJAIYAH,
  { arabic: "ر", name: "Ra" },
  { arabic: "س", name: "Sin" },
];

const BEST_KEY = "belajarngaji:v2:memori-best";

interface Card {
  uid: number;
  letter: number; // index into LETTERS
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(pairs: number): Card[] {
  const picks = shuffle(LETTERS.map((_, i) => i)).slice(0, pairs);
  return shuffle(
    picks.flatMap((letter, k) => [
      { uid: k * 2, letter, matched: false },
      { uid: k * 2 + 1, letter, matched: false },
    ]),
  );
}

function loadBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export function MemoryGame() {
  const [pairs, setPairs] = useState(6);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]); // uids currently face-up, unmatched
  const [tries, setTries] = useState(0);
  const [found, setFound] = useState(0);
  const [won, setWon] = useState(false);
  const [justMatched, setJustMatched] = useState<number[]>([]);
  const [best, setBest] = useState<Record<string, number>>({});
  const lock = useRef(false);

  const start = (n: number) => {
    setPairs(n);
    setDeck(makeDeck(n));
    setOpen([]);
    setTries(0);
    setFound(0);
    setWon(false);
    setJustMatched([]);
    lock.current = false;
  };

  useEffect(() => {
    setDeck(makeDeck(6));
    setBest(loadBest());
  }, []);

  const tap = (card: Card) => {
    if (lock.current || won || card.matched || open.includes(card.uid)) return;
    if (open.length === 0) {
      setOpen([card.uid]);
      return;
    }
    const firstUid = open[0];
    const first = deck.find((c) => c.uid === firstUid);
    setTries((t) => t + 1);
    if (first && first.letter === card.letter) {
      const next = deck.map((c) =>
        c.letter === card.letter ? { ...c, matched: true } : c,
      );
      setDeck(next);
      setOpen([]);
      setJustMatched([firstUid, card.uid]);
      window.setTimeout(() => setJustMatched([]), 700);
      const nf = found + 1;
      setFound(nf);
      if (nf === pairs) {
        setWon(true);
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.4 },
          colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#3FBFB2", "#ffffff"],
        });
        setBest((prev) => {
          const key = String(pairs);
          if (prev[key] !== undefined && prev[key] <= tries + 1) return prev;
          const updated = { ...prev, [key]: tries + 1 };
          try {
            localStorage.setItem(BEST_KEY, JSON.stringify(updated));
          } catch {
            /* ignore */
          }
          return updated;
        });
      }
    } else {
      setOpen([firstUid, card.uid]);
      lock.current = true;
      window.setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 950);
    }
  };

  const stars = tries <= pairs + 3 ? 3 : tries <= pairs * 2 ? 2 : 1;
  const bestThis = best[String(pairs)];

  return (
    <div className="flex flex-col gap-4">
      <GameGuide gameId="memori" title="Kartu Pasangan Hijaiyah" steps={[{ icon: "👆", text: "Ketuk kartu untuk membukanya" }, { icon: "🔍", text: "Cari dua kartu huruf yang sama" }, { icon: "🎉", text: "Kumpulkan semua pasangan!" }]} />
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0">
          <CloudPuppy size={64} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Kartu Pasangan Hijaiyah</h1>
          <p className="text-base font-semibold text-sky-900/70">
            Ketuk kartu awan untuk membaliknya — temukan dua huruf yang sama!
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-token">Pasangan: {found}/{pairs}</span>
        <span className="chip-token">Percobaan: {tries}</span>
        {bestThis !== undefined && <span className="chip-token">Terbaik: {bestThis} percobaan</span>}
        <button
          type="button"
          className="btn-candy btn-candy-white ml-auto min-h-12 px-5"
          onClick={() => start(pairs)}
        >
          Acak Ulang
        </button>
      </div>

      <div className="card-cloud mx-auto w-full max-w-[430px] p-3">
        <div className="grid grid-cols-4 gap-2">
          {deck.map((card) => {
            const faceUp = card.matched || open.includes(card.uid);
            const L = LETTERS[card.letter];
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => tap(card)}
                aria-label={faceUp ? `Huruf ${L.name}` : "Kartu tertutup"}
                className="flip-scene aspect-[3/4] min-h-14 w-full"
              >
                <span className={`flip-inner block ${faceUp ? "is-flipped" : ""}`}>
                  {/* face-down: cloud card */}
                  <span className="flip-face grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-300 to-blue-400 shadow ring-2 ring-white/70">
                    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
                      <path
                        d="M14 36 a8 8 0 1 1 2-15.8 A10 10 0 0 1 35 18 a7.5 7.5 0 1 1 1 18 Z"
                        fill="#ffffff"
                        opacity="0.95"
                      />
                      <path
                        d="M24 8 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4Z"
                        fill="#FFD66E"
                      />
                    </svg>
                  </span>
                  {/* face-up: the letter */}
                  <span
                    className={`flip-face flip-face--back grid place-items-center rounded-2xl shadow ring-2 ${
                      card.matched
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 ring-teal-300"
                        : "bg-white ring-sky-200"
                    } ${justMatched.includes(card.uid) ? "pop-place" : ""}`}
                  >
                    <span
                      className="text-4xl leading-none text-sky-800"
                      style={{ fontFamily: "var(--font-amiri), serif" }}
                    >
                      {L.arabic}
                    </span>
                    <span className="mt-1 text-[11px] font-extrabold uppercase tracking-wide text-sky-500">
                      {L.name}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {won ? (
        <div className="card-cloud pop-place p-5 text-center">
          <p className="text-4xl tracking-[0.3em]" aria-hidden="true">
            <span className="text-amber-400">★</span>
            <span className={stars >= 2 ? "text-amber-400" : "text-sky-200"}>★</span>
            <span className={stars >= 3 ? "text-amber-400" : "text-sky-200"}>★</span>
          </p>
          <p className="mt-1 text-2xl font-extrabold text-sky-700">Masya Allah, semua pasangan ketemu!</p>
          <p className="mt-1 text-base font-semibold text-sky-900/70">
            Selesai dalam {tries} percobaan.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {pairs < 8 && (
              <button
                type="button"
                className="btn-candy btn-candy-pink min-h-12 px-6"
                onClick={() => start(8)}
              >
                Naik Level: 8 Pasangan
              </button>
            )}
            <button
              type="button"
              className="btn-candy min-h-12 px-6"
              onClick={() => start(pairs)}
            >
              Main Lagi
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-base font-bold text-sky-700" aria-live="polite">
          {open.length === 1
            ? "Satu terbuka! Cari pasangannya…"
            : "Ketuk satu kartu untuk mulai."}
        </p>
      )}
    </div>
  );
}
