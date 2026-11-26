"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";

/* Ikuti Bintang — a Simon clone (cf. "Simon Musik" on games.co.id): watch
   the shapes light up and sing, then tap them back in the same order.
   Wrong tap never ends the game — the same sequence simply replays. */

const BEST_KEY = "belajarngaji:v2:simon-best";

interface Pad {
  id: string;
  name: string;
  arabic: string;
  letterName: string;
  freq: number;
  bg: string; // soft pad background
  bgLit: string; // lit background
  ring: string;
  shape: string; // shape colour
}

const PADS: Pad[] = [
  {
    id: "star", name: "Bintang", arabic: "ا", letterName: "Alif", freq: 523.25,
    bg: "bg-amber-100", bgLit: "bg-amber-300", ring: "ring-amber-400", shape: "#F5B921",
  },
  {
    id: "moon", name: "Bulan", arabic: "ب", letterName: "Ba", freq: 392.0,
    bg: "bg-sky-100", bgLit: "bg-sky-300", ring: "ring-sky-400", shape: "#2F7FC4",
  },
  {
    id: "cloud", name: "Awan", arabic: "ت", letterName: "Ta", freq: 329.63,
    bg: "bg-pink-100", bgLit: "bg-pink-300", ring: "ring-pink-400", shape: "#E7548F",
  },
  {
    id: "heart", name: "Hati", arabic: "ث", letterName: "Tsa", freq: 261.63,
    bg: "bg-teal-100", bgLit: "bg-teal-300", ring: "ring-teal-400", shape: "#2AA79B",
  },
];

type Phase = "idle" | "showing" | "input";

function PadShape({ pad }: { pad: Pad }) {
  const c = pad.shape;
  if (pad.id === "star")
    return (
      <svg viewBox="0 0 48 48" className="h-16 w-16" aria-hidden="true">
        <path d="M24 4 l4.6 10.4 11.4 1.2 -8.4 7.8 2.3 11.2 L24 29.2 14.1 34.6 16.4 23.4 8 15.6 11.4 -1.2Z" fill={c} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    );
  if (pad.id === "moon")
    return (
      <svg viewBox="0 0 48 48" className="h-16 w-16" aria-hidden="true">
        <path d="M33 5 a17 17 0 1 0 10 27 A13.5 13.5 0 1 1 33 5Z" fill={c} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    );
  if (pad.id === "cloud")
    return (
      <svg viewBox="0 0 48 48" className="h-16 w-16" aria-hidden="true">
        <path d="M13 38 a9 9 0 1 1 2.2-17.8 A11 11 0 0 1 36 18 a8.4 8.4 0 1 1 1.2 20 Z" fill={c} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className="h-16 w-16" aria-hidden="true">
      <path d="M24 41 C12 32 7 25.6 7 18.6 7 13.4 11 10 15.4 10 c3.4 0 6.8 2 8.6 5 1.8-3 5.2-5 8.6-5 C37 10 41 13.4 41 18.6 c0 7-5 13.4-17 22.4Z" fill={c} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

export function SimonGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hint, setHint] = useState("Tekan Mulai, lalu perhatikan bentuk yang menyala!");
  const progress = useRef(0);
  const timers = useRef<number[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(BEST_KEY));
      if (b > 0) setBest(b);
    } catch {
      /* ignore */
    }
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const tone = (freq: number) => {
    if (mutedRef.current) return;
    try {
      if (!audio.current) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        audio.current = new AC();
      }
      const ctx = audio.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      /* no audio — the light show still works */
    }
  };

  const flash = (padIdx: number, ms = 480) => {
    setLit(padIdx);
    tone(PADS[padIdx].freq);
    later(() => setLit(null), ms);
  };

  const showSequence = (s: number[], delay = 700) => {
    setPhase("showing");
    setHint("Lihat ya… ingat urutannya!");
    s.forEach((padIdx, i) => {
      later(() => flash(padIdx, 520), delay + i * 780);
    });
    later(() => {
      progress.current = 0;
      setPhase("input");
      setHint("Giliranmu! Ketuk dengan urutan yang sama.");
    }, delay + s.length * 780 + 150);
  };

  const startGame = () => {
    const s = [Math.floor(Math.random() * 4)];
    setSeq(s);
    setRound(1);
    showSequence(s, 500);
  };

  const tapPad = (padIdx: number) => {
    if (phase !== "input") return;
    flash(padIdx, 320);
    if (padIdx === seq[progress.current]) {
      progress.current += 1;
      if (progress.current === seq.length) {
        const finishedRound = round;
        setBest((prev) => {
          const nb = Math.max(prev, finishedRound);
          try {
            localStorage.setItem(BEST_KEY, String(nb));
          } catch {
            /* ignore */
          }
          return nb;
        });
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
          colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#3FBFB2", "#ffffff"],
        });
        setPhase("showing");
        setHint("Hebat! Satu lagi ditambah… perhatikan ya!");
        const next = [...seq, Math.floor(Math.random() * 4)];
        later(() => {
          setSeq(next);
          setRound(finishedRound + 1);
          showSequence(next, 350);
        }, 1100);
      }
    } else {
      setPhase("showing");
      setHint("Hampir! Coba lagi — urutannya diulang ya.");
      later(() => showSequence(seq, 400), 1000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0">
          <CloudPuppy size={64} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Ikuti Bintang</h1>
          <p className="text-base font-semibold text-sky-900/70">
            Perhatikan yang menyala, lalu ketuk dengan urutan yang sama!
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-token">Ronde: {round}</span>
        {best > 0 && <span className="chip-token">Terbaik: ronde {best}</span>}
        <button
          type="button"
          className="btn-candy btn-candy-white ml-auto min-h-12 px-5"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
        >
          {muted ? "Suara: Mati" : "Suara: Nyala"}
        </button>
      </div>

      <div className="card-cloud mx-auto w-full max-w-[430px] p-3">
        <div className="grid grid-cols-2 gap-3">
          {PADS.map((pad, i) => (
            <button
              key={pad.id}
              type="button"
              onClick={() => tapPad(i)}
              disabled={phase !== "input"}
              aria-label={`${pad.name}, huruf ${pad.letterName}`}
              className={`relative grid aspect-square min-h-24 place-items-center rounded-[2rem] shadow ring-4 transition-all duration-150 ${
                lit === i
                  ? `${pad.bgLit} ${pad.ring} scale-[1.04] brightness-110`
                  : `${pad.bg} ring-white`
              } ${phase === "input" ? "active:scale-95" : ""}`}
            >
              <PadShape pad={pad} />
              <span
                className="absolute right-3 top-2 text-2xl leading-none text-sky-900/60"
                style={{ fontFamily: "var(--font-amiri), serif" }}
                aria-hidden="true"
              >
                {pad.arabic}
              </span>
              <span className="absolute bottom-2 text-sm font-extrabold text-sky-900/60">
                {pad.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>

      {phase === "idle" && (
        <button type="button" className="btn-candy btn-candy-pink mx-auto min-h-14 px-10 text-lg" onClick={startGame}>
          Mulai
        </button>
      )}
      {phase !== "idle" && (
        <button
          type="button"
          className="btn-candy btn-candy-white mx-auto min-h-12 px-6"
          onClick={() => {
            timers.current.forEach((t) => window.clearTimeout(t));
            timers.current = [];
            setLit(null);
            setPhase("idle");
            setRound(0);
            setSeq([]);
            setHint("Tekan Mulai, lalu perhatikan bentuk yang menyala!");
          }}
        >
          Berhenti & Ulang dari Awal
        </button>
      )}
    </div>
  );
}
