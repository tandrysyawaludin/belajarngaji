"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { KidQuestion } from "@/components/KidQuestion";
import { useStrings } from "@/components/LocaleProvider";

const KEY = "belajarngaji:bangun-masjid";
const COLS = 10;
const ROWS = 8;

interface BlockDef { id: string; label: string; bg: string; emoji?: string }
const BLOCKS: BlockDef[] = [
  { id: "sky", label: "Biru", bg: "#5EB2F2" },
  { id: "pink", label: "Pink", bg: "#FF9FC6" },
  { id: "yellow", label: "Kuning", bg: "#FFD66E" },
  { id: "mint", label: "Mint", bg: "#7FE3B0" },
  { id: "lav", label: "Lavender", bg: "#B79CFF" },
  { id: "white", label: "Putih", bg: "#FFFFFF" },
  { id: "dome", label: "Kubah", bg: "#AEE3FF", emoji: "🕌" },
  { id: "crescent", label: "Bulan Sabit", bg: "#FFF3C9", emoji: "🌙" },
  { id: "door", label: "Pintu", bg: "#C98B5E", emoji: "🚪" },
  { id: "window", label: "Jendela", bg: "#D6F0FF", emoji: "🪟" },
  { id: "minaret", label: "Menara", bg: "#E6E0FF", emoji: "🗼" },
];

type Cell = string | null;

export function BuildMosqueGame() {
  const strings = useStrings();
  const [grid, setGrid] = useState<Cell[]>(Array(COLS * ROWS).fill(null));
  const [balance, setBalance] = useState(30);
  const [selected, setSelected] = useState<string>("sky");
  const [eraser, setEraser] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw) as { grid: Cell[]; balance: number }; if (Array.isArray(s.grid) && s.grid.length === COLS * ROWS) { setGrid(s.grid); setBalance(s.balance); } }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify({ grid, balance })); }, [grid, balance, loaded]);

  const challengeMet = useMemo(() => {
    const hasDome = grid.includes("dome");
    let tall = 0;
    for (let c = 0; c < COLS; c++) {
      let h = 0;
      for (let r = ROWS - 1; r >= 0; r--) { if (grid[r * COLS + c]) h++; else break; }
      if (h >= 4) tall++;
    }
    return hasDome && tall >= 2;
  }, [grid]);

  useEffect(() => {
    if (challengeMet && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
    }
    if (!challengeMet) setCelebrated(false);
  }, [challengeMet, celebrated]);

  const tap = (idx: number) => {
    if (eraser) {
      if (grid[idx]) { setGrid((g) => { const n = [...g]; n[idx] = null; return n; }); setBalance((b) => b + 1); }
      return;
    }
    if (grid[idx] || balance <= 0) return;
    setGrid((g) => { const n = [...g]; n[idx] = selected; return n; });
    setBalance((b) => b - 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-violet-100">
        <h1 className="text-2xl font-extrabold text-violet-700 sm:text-3xl">🕌 {strings.cardBuildTitle}</h1>
        <p className="mt-1 font-semibold text-violet-900/70">{strings.buildPageDesc}</p>
        <p className="mt-3 rounded-full bg-violet-100 px-4 py-2 text-center font-extrabold text-violet-800">
          🏆 Tantangan: bangun masjid dengan kubah dan 2 menara tinggi! {challengeMet ? "— BERHASIL! Masya Allah! 🎉" : ""}
        </p>
        <p className="mt-2 text-center text-lg font-extrabold text-violet-700">🧱 Blokku: {balance}</p>
      </section>

      {/* Baseplate */}
      <section className="rounded-[2rem] bg-gradient-to-b from-sky-200 to-emerald-100 p-3 shadow-xl ring-4 ring-white sm:p-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
          {grid.map((cell, i) => {
            const def = BLOCKS.find((b) => b.id === cell);
            return (
              <button key={i} type="button" onClick={() => tap(i)} aria-label={`Blok ${i + 1}`}
                className="grid aspect-square place-items-center rounded-lg text-base shadow-sm ring-1 ring-white/70 transition active:scale-90 sm:text-2xl"
                style={{ background: def ? def.bg : "rgba(255,255,255,0.45)" }}>
                {def?.emoji ?? ""}
              </button>
            );
          })}
        </div>
        <div className="mt-2 h-3 rounded-full bg-emerald-400/70" aria-hidden="true" />
      </section>

      <section className="rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-violet-100">
        <h2 className="font-extrabold text-violet-700">🎨 Palet Blok — pilih, lalu ketuk papan!</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BLOCKS.map((b) => (
            <button key={b.id} type="button" onClick={() => { setSelected(b.id); setEraser(false); }}
              className={`flex min-h-12 items-center gap-2 rounded-full px-4 py-2 font-extrabold shadow transition active:scale-95 ${selected === b.id && !eraser ? "ring-4 ring-violet-400 scale-105" : ""} bg-white text-violet-900`}>
              <span className="h-7 w-7 rounded-md ring-2 ring-white shadow" style={{ background: b.bg }}>{b.emoji ?? ""}</span>{b.label}
            </button>
          ))}
          <button type="button" onClick={() => setEraser(true)}
            className={`min-h-12 rounded-full px-4 py-2 font-extrabold shadow transition active:scale-95 ${eraser ? "bg-rose-500 text-white ring-4 ring-rose-300" : "bg-rose-100 text-rose-800"}`}>🧽 Penghapus</button>
        </div>
        {balance <= 0 && <p className="mt-3 font-bold text-rose-500">Blokmu habis! Jawab soal di bawah untuk dapat +5 blok ya ☁️</p>}
      </section>

      {showQ ? (
        <KidQuestion cta="Ambil +5 Blok 🧱" onCorrect={() => { setBalance((b) => b + 5); setShowQ(false); }} />
      ) : (
        <button type="button" onClick={() => setShowQ(true)} className="min-h-14 rounded-full bg-gradient-to-r from-violet-400 to-sky-400 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition active:scale-95">
          ⭐ Jawab Soal, Dapat +5 Blok!
        </button>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => { setGrid(Array(COLS * ROWS).fill(null)); setBalance(30); setCelebrated(false); }}
          className="min-h-14 rounded-full bg-white px-6 py-3 text-lg font-extrabold text-violet-700 shadow ring-4 ring-violet-100 transition active:scale-95">🗑️ Bersihkan Papan</button>
        <button type="button" onClick={() => confetti({ particleCount: 140, spread: 100, origin: { y: 0.6 } })}
          className="min-h-14 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition active:scale-95">{strings.playAgain} — Rayakan! 🎉</button>
      </div>
    </div>
  );
}
