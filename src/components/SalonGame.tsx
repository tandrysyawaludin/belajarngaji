"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { KidQuestion } from "@/components/KidQuestion";
import { useStrings } from "@/components/LocaleProvider";

const KEY = "belajarngaji:salon";

interface Option { id: string; label: string; value: string; locked?: boolean }
interface Category { id: string; label: string; emoji: string; options: Option[] }

const CATEGORIES: Category[] = [
  { id: "hijab", label: "Hijab", emoji: "🧕", options: [
    { id: "sky", label: "Biru Langit", value: "#7EC8F7" }, { id: "pink", label: "Pink", value: "#FFB7D5" },
    { id: "lav", label: "Lavender", value: "#C4B1FF" }, { id: "mint", label: "Mint", value: "#9FE8C4" },
    { id: "cream", label: "Krim", value: "#FFE9B8" }, { id: "gold", label: "Emas ⭐", value: "#FFD66E", locked: true },
    { id: "rainbow", label: "Pelangi ⭐", value: "#F9A8D4", locked: true },
  ]},
  { id: "dress", label: "Baju", emoji: "👗", options: [
    { id: "pink", label: "Pink", value: "#FF9FC6" }, { id: "sky", label: "Biru", value: "#5EB2F2" },
    { id: "lilac", label: "Lilac", value: "#B79CFF" }, { id: "peach", label: "Peach", value: "#FFB59E" },
    { id: "star", label: "Bintang ⭐", value: "#FFD66E", locked: true },
  ]},
  { id: "blush", label: "Blush", emoji: "🌸", options: [
    { id: "none", label: "Tanpa", value: "transparent" }, { id: "soft", label: "Pink Lembut", value: "#FFB7D5" },
    { id: "peach", label: "Peach", value: "#FFB59E" }, { id: "rose", label: "Mawar ⭐", value: "#FF7FA5", locked: true },
  ]},
  { id: "lip", label: "Lipstik", emoji: "💄", options: [
    { id: "natural", label: "Natural", value: "#E58A9A" }, { id: "pink", label: "Pink", value: "#FF6FA5" },
    { id: "peach", label: "Peach", value: "#FF9E7A" }, { id: "berry", label: "Berry ⭐", value: "#D6336C", locked: true },
  ]},
  { id: "shadow", label: "Eyeshadow", emoji: "✨", options: [
    { id: "none", label: "Tanpa", value: "transparent" }, { id: "sky", label: "Langit", value: "#AEE3FF" },
    { id: "pink", label: "Pink", value: "#FFD6E8" }, { id: "gold", label: "Emas ⭐", value: "#FFE29A", locked: true },
  ]},
  { id: "acc", label: "Aksesori", emoji: "🎀", options: [
    { id: "none", label: "Tanpa", value: "" }, { id: "bow", label: "Pita", value: "🎀" },
    { id: "flower", label: "Bunga", value: "🌸" }, { id: "crown", label: "Mahkota", value: "👑" },
    { id: "star", label: "Pin Bintang ⭐", value: "⭐", locked: true }, { id: "glasses", label: "Kacamata ⭐", value: "🕶️", locked: true },
    { id: "bag", label: "Tas ⭐", value: "👜", locked: true },
  ]},
];

type Look = Record<string, string>;
const DEFAULT_LOOK: Look = { hijab: "#7EC8F7", dress: "#FF9FC6", blush: "#FFB7D5", lip: "#E58A9A", shadow: "transparent", acc: "🎀" };

export function SalonGame() {
  const strings = useStrings();
  const [tab, setTab] = useState("hijab");
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [pending, setPending] = useState<{ cat: string; opt: Option } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw) as { look: Look; unlocked: string[] }; setLook({ ...DEFAULT_LOOK, ...s.look }); setUnlocked(s.unlocked ?? []); }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify({ look, unlocked })); }, [look, unlocked, loaded]);

  const cat = CATEGORIES.find((c) => c.id === tab)!;
  const apply = (opt: Option) => {
    if (opt.locked && !unlocked.includes(`${cat.id}:${opt.id}`)) { setPending({ cat: cat.id, opt }); return; }
    setLook((l) => ({ ...l, [cat.id]: opt.value }));
  };
  const randomize = () => {
    const next: Look = {};
    for (const c of CATEGORIES) {
      const free = c.options.filter((o) => !o.locked || unlocked.includes(`${c.id}:${o.id}`));
      next[c.id] = free[Math.floor(Math.random() * free.length)].value;
    }
    setLook(next);
  };
  const celebrate = () => confetti({ particleCount: 170, spread: 110, origin: { y: 0.55 }, colors: ["#FFB7D5", "#7EC8F7", "#FFD66E", "#ffffff"] });

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[2rem] bg-white/90 p-5 text-center shadow-md ring-4 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">🎀 {strings.cardSalonTitle}</h1>
        <p className="mt-1 font-semibold text-pink-900/70">{strings.salonPageDesc}</p>
      </section>

      {/* Mirror stage */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-100 via-pink-50 to-white p-6 shadow-xl ring-4 ring-white">
        <span className="sparkle absolute left-6 top-6 text-2xl">✨</span>
        <span className="sparkle absolute right-8 top-10 text-2xl">⭐</span>
        <span className="sparkle absolute bottom-8 left-10 text-xl">💖</span>
        <p className="text-center text-lg font-extrabold text-sky-700">🪞 Nadia, sahabat salonmu 🪞</p>
        <div className="relative mx-auto mt-2 w-fit">
          <svg width="260" height="300" viewBox="0 0 260 300" role="img" aria-label="Sahabat salon berhijab">
            {/* dress */}
            <path d="M130 218 L62 296 Q130 312 198 296 Z" fill={look.dress} stroke="#ffffff" strokeWidth="4" />
            <circle cx="130" cy="262" r="7" fill="#ffffff" opacity="0.8" />
            {/* hijab */}
            <path d="M130 18 C76 18 52 66 52 118 C52 168 76 214 130 214 C184 214 208 168 208 118 C208 66 184 18 130 18 Z" fill={look.hijab} />
            <path d="M130 34 C88 34 68 72 68 116 C68 158 90 196 130 196 C170 196 192 158 192 116 C192 72 172 34 130 34 Z" fill="#FFF3E2" />
            {/* eyeshadow */}
            {look.shadow !== "transparent" && (<>
              <ellipse cx="102" cy="106" rx="17" ry="9" fill={look.shadow} opacity="0.85" />
              <ellipse cx="158" cy="106" rx="17" ry="9" fill={look.shadow} opacity="0.85" />
            </>)}
            {/* eyes + smile */}
            <circle cx="102" cy="118" r="6" fill="#23405E" /><circle cx="158" cy="118" r="6" fill="#23405E" />
            <circle cx="104" cy="116" r="2" fill="#fff" /><circle cx="160" cy="116" r="2" fill="#fff" />
            <path d="M116 152 Q130 164 144 152" fill="none" stroke={look.lip} strokeWidth="6" strokeLinecap="round" />
            {/* blush */}
            {look.blush !== "transparent" && (<>
              <ellipse cx="84" cy="140" rx="14" ry="9" fill={look.blush} opacity="0.9" />
              <ellipse cx="176" cy="140" rx="14" ry="9" fill={look.blush} opacity="0.9" />
            </>)}
          </svg>
          {look.acc && look.acc !== "🕶️" && look.acc !== "👜" && (
            <span className="bounce-soft absolute -top-1 right-2 text-5xl">{look.acc}</span>
          )}
          {look.acc === "🕶️" && <span className="absolute left-1/2 top-[92px] -translate-x-1/2 text-6xl">🕶️</span>}
          {look.acc === "👜" && <span className="absolute -right-4 bottom-2 text-5xl">👜</span>}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-pink-100">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setTab(c.id)}
              className={`min-h-12 rounded-full px-4 py-2 font-extrabold shadow transition active:scale-95 ${tab === c.id ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-900"}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {cat.options.map((o) => {
            const locked = o.locked && !unlocked.includes(`${cat.id}:${o.id}`);
            const active = look[cat.id] === o.value;
            return (
              <button key={o.id} type="button" onClick={() => apply(o)}
                className={`flex min-h-14 items-center gap-2 rounded-full px-4 py-2 font-extrabold shadow transition active:scale-95 ${active ? "ring-4 ring-pink-400 scale-105" : ""} bg-white`}>
                {cat.id === "acc" ? <span className="text-2xl">{locked ? "🔒" : o.value || "🚫"}</span>
                  : <span className="h-8 w-8 rounded-full ring-2 ring-white shadow" style={{ background: o.value === "transparent" ? "repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/10px 10px" : o.value }} />}
                <span className="text-pink-900">{locked ? "🔒 " : ""}{o.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm font-bold text-pink-900/60">Yang ada tanda ⭐ adalah Bintang Salon — jawab satu soal seru untuk membukanya!</p>
      </section>

      {pending && (
        <KidQuestion cta="Buka Bintang Salon ⭐" onCorrect={() => { setUnlocked((u) => [...u, `${pending.cat}:${pending.opt.id}`]); setLook((l) => ({ ...l, [pending.cat]: pending.opt.value })); setPending(null); }} />
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={randomize} className="min-h-14 rounded-full bg-gradient-to-r from-violet-400 to-pink-400 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition active:scale-95">🎲 Acak Cantik!</button>
        <button type="button" onClick={celebrate} className="min-h-14 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition active:scale-95">Cantik sekali, masya Allah! ✨</button>
        <button type="button" onClick={() => setLook(DEFAULT_LOOK)} className="min-h-14 rounded-full bg-white px-6 py-3 text-lg font-extrabold text-pink-600 shadow ring-4 ring-pink-100 transition active:scale-95">{strings.playAgain} / Ulangi</button>
      </div>
    </div>
  );
}
