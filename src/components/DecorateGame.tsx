"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { KidQuestion } from "@/components/KidQuestion";
import { useStrings } from "@/components/LocaleProvider";

const KEY = "belajarngaji:dekorasi";
const WALLS = ["#D6F0FF", "#FFE3F0", "#FFF3C9", "#E6E0FF", "#D9F7E8", "#FFFFFF"];
const FLOORS = [
  { id: "pink", label: "Karpet Pink", bg: "linear-gradient(180deg,#FFD6E8,#FFB7D5)" },
  { id: "sky", label: "Karpet Langit", bg: "linear-gradient(180deg,#CDEBFF,#7EC8F7)" },
  { id: "cream", label: "Lantai Krim", bg: "linear-gradient(180deg,#FFF6DE,#F5DFB0)" },
  { id: "mint", label: "Karpet Mint", bg: "linear-gradient(180deg,#D9F7E8,#9FE8C4)" },
];
const ITEMS = [
  { id: "sajjadah", emoji: "🧕", label: "Sajjadah", locked: false },
  { id: "rehal", emoji: "📖", label: "Rehal & Qur'an", locked: false },
  { id: "plant", emoji: "🪴", label: "Tanaman", locked: false },
  { id: "teddy", emoji: "🧸", label: "Boneka", locked: false },
  { id: "cushion", emoji: "☁️", label: "Bantal Awan", locked: false },
  { id: "balloon", emoji: "🎈", label: "Balon", locked: false },
  { id: "stars", emoji: "⭐", label: "Lampu Bintang", locked: false },
  { id: "lamp", emoji: "🌙", label: "Lampu Bulan", locked: true },
  { id: "frame", emoji: "🖼️", label: "Kaligrafi", locked: true },
  { id: "shelf", emoji: "📚", label: "Rak Buku", locked: true },
] as const;

interface Saved { wall: string; floor: string; slots: (string | null)[]; unlocked: string[] }

const DEFAULTS: Saved = { wall: WALLS[0], floor: "pink", slots: Array(9).fill(null), unlocked: [] };

export function DecorateGame() {
  const strings = useStrings();
  const [wall, setWall] = useState(DEFAULTS.wall);
  const [floor, setFloor] = useState(DEFAULTS.floor);
  const [slots, setSlots] = useState<(string | null)[]>(DEFAULTS.slots);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("sajjadah");
  const [pendingUnlock, setPendingUnlock] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        setWall(s.wall); setFloor(s.floor); setSlots(s.slots); setUnlocked(s.unlocked ?? []);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ wall, floor, slots, unlocked } satisfies Saved));
  }, [wall, floor, slots, unlocked, loaded]);

  const isLocked = (id: string) => ITEMS.find((i) => i.id === id)?.locked && !unlocked.includes(id);
  const floorBg = FLOORS.find((f) => f.id === floor)?.bg ?? FLOORS[0].bg;

  const tapSlot = (idx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = next[idx] ? null : selected;
      return next;
    });
  };

  const finish = () => {
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-center gap-4 rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-sky-100">
        <span className="floaty"><CloudPuppy size={84} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700 sm:text-3xl">🏠 {strings.cardDecorateTitle}</h1>
          <p className="mt-1 font-semibold text-sky-900/70">{strings.decoratePageDesc}</p>
        </div>
      </section>

      {/* Room scene: top 2 rows = wall, bottom row = floor */}
      <section className="overflow-hidden rounded-[2rem] shadow-xl ring-4 ring-white">
        <div className="grid grid-cols-3" style={{ background: wall }}>
          {slots.slice(0, 6).map((s, i) => (
            <button key={i} type="button" onClick={() => tapSlot(i)} aria-label={`Kotak kamar ${i + 1}`}
              className="grid min-h-28 place-items-center border-2 border-dashed border-white/70 text-6xl transition hover:bg-white/30 active:scale-95 sm:min-h-32">
              {s ? ITEMS.find((it) => it.id === s)?.emoji : <span className="text-2xl opacity-40">＋</span>}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3" style={{ background: floorBg }}>
          {slots.slice(6).map((s, j) => {
            const i = j + 6;
            return (
              <button key={i} type="button" onClick={() => tapSlot(i)} aria-label={`Kotak lantai ${j + 1}`}
                className="grid min-h-28 place-items-center border-2 border-dashed border-white/70 text-6xl transition hover:bg-white/30 active:scale-95 sm:min-h-32">
                {s ? ITEMS.find((it) => it.id === s)?.emoji : <span className="text-2xl opacity-40">＋</span>}
              </button>
            );
          })}
        </div>
      </section>
      <p className="text-center text-sm font-bold text-sky-900/60">Ketuk kotak untuk memasang barang pilihanmu • ketuk barang yang sudah terpasang untuk melepasnya</p>

      <section className="rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-sky-100">
        <h2 className="font-extrabold text-sky-700">🎨 Warna Dinding</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {WALLS.map((c) => (
            <button key={c} type="button" onClick={() => setWall(c)} aria-label={`Dinding ${c}`}
              className={`h-12 w-12 rounded-full ring-4 transition active:scale-90 ${wall === c ? "ring-sky-400 scale-110" : "ring-white"}`} style={{ background: c }} />
          ))}
        </div>
        <h2 className="mt-5 font-extrabold text-sky-700">🧶 Lantai & Karpet</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLOORS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFloor(f.id)}
              className={`min-h-12 rounded-full px-4 py-2 font-extrabold shadow transition active:scale-95 ${floor === f.id ? "bg-sky-500 text-white" : "bg-sky-100 text-sky-900"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <h2 className="mt-5 font-extrabold text-sky-700">🧺 Nampan Barang — pilih dulu, lalu ketuk kamar!</h2>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {ITEMS.map((it) => {
            const locked = isLocked(it.id);
            return (
              <button key={it.id} type="button"
                onClick={() => (locked ? setPendingUnlock(it.id) : setSelected(it.id))}
                className={`flex min-h-16 flex-col items-center justify-center rounded-3xl p-2 text-3xl shadow transition active:scale-90 ${selected === it.id && !locked ? "bg-sky-200 ring-4 ring-sky-400" : "bg-sky-50"}`}>
                <span>{locked ? "🔒" : it.emoji}</span>
                <span className="mt-1 text-[10px] font-extrabold leading-tight text-sky-900">{it.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {pendingUnlock && (
        <KidQuestion
          cta={`Buka ${ITEMS.find((i) => i.id === pendingUnlock)?.label} 🔓`}
          onCorrect={() => { setUnlocked((u) => [...u, pendingUnlock]); setSelected(pendingUnlock); setPendingUnlock(null); }}
        />
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={finish} className="min-h-14 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 px-8 py-3 text-xl font-extrabold text-white shadow-lg transition active:scale-95">Selesai ✨</button>
        <button type="button" onClick={() => { setSlots(Array(9).fill(null)); setWall(WALLS[0]); setFloor("pink"); }}
          className="min-h-14 rounded-full bg-white px-6 py-3 text-lg font-extrabold text-sky-700 shadow ring-4 ring-sky-100 transition active:scale-95">{strings.playAgain} / Ulangi</button>
      </div>
    </div>
  );
}
