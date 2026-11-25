"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { EarnSheet } from "@/components/EarnSheet";
import { HIJAIYAH } from "@/components/KidQuestion";

const LETTERS = [
  ...HIJAIYAH,
  { arabic: "ذ", name: "Dzal" }, { arabic: "ر", name: "Ra" }, { arabic: "ز", name: "Za" },
  { arabic: "س", name: "Sin" }, { arabic: "ش", name: "Syin" }, { arabic: "ص", name: "Shad" },
  { arabic: "ض", name: "Dhad" }, { arabic: "ط", name: "Tha" }, { arabic: "ظ", name: "Zha" },
  { arabic: "ع", name: "Ain" },
];
const KEY = "belajarngaji:v2:huruf-awan";

interface Cloud { id: number; letter: number; x: number; y: number; speed: number; wrong: boolean }

function shuffleIdx(except: number): number[] {
  const pool = LETTERS.map((_, i) => i).filter((i) => i !== except);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool;
}

export function CloudLetterGame() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * LETTERS.length));
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(0);
  const [level, setLevel] = useState(1);
  const [earnOpen, setEarnOpen] = useState(false);
  const [popId, setPopId] = useState<number | null>(null);
  const [msg, setMsg] = useState("Ketuk awan yang membawa huruf yang dicari!");
  const idRef = useRef(1);
  const stateRef = useRef({ target, level });
  stateRef.current = { target, level };

  const spawn = useCallback((tgt: number, lvl: number) => {
    const distract = shuffleIdx(tgt).slice(0, 3);
    const all = [tgt, ...distract];
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    setClouds(all.map((letter, i) => ({
      id: idRef.current++, letter, x: -22 - i * 26, y: 6 + ((i * 23 + Math.random() * 8) % 62),
      speed: (0.14 + Math.random() * 0.1) * (1 + (lvl - 1) * 0.22), wrong: false,
    })));
  }, []);

  useEffect(() => { spawn(target, 1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { try { setBest(Number(localStorage.getItem(KEY) ?? 0) || 0); } catch { /* ignore */ } }, []);

  // drift loop
  useEffect(() => {
    const iv = window.setInterval(() => {
      setClouds((cs) => cs.map((c) => {
        const nx = c.x + c.speed;
        if (nx > 112) {
          // recycle with a fresh random letter (never a second target)
          const { target: tgt } = stateRef.current;
          let letter = Math.floor(Math.random() * LETTERS.length);
          if (letter === tgt && cs.some((o) => o.id !== c.id && o.letter === tgt)) letter = (letter + 3) % LETTERS.length;
          return { ...c, x: -22, y: 6 + Math.random() * 62, letter, wrong: false };
        }
        return { ...c, x: nx };
      }));
    }, 50);
    return () => window.clearInterval(iv);
  }, []);

  const tapCloud = (c: Cloud) => {
    if (c.letter === target) {
      setPopId(c.id);
      confetti({ particleCount: 45, spread: 55, startVelocity: 22, origin: { y: 0.4 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
      const ns = score + 10; setScore(ns);
      if (ns > best) { setBest(ns); try { localStorage.setItem(KEY, String(ns)); } catch { /* ignore */ } }
      const nstreak = streak + 1; setStreak(nstreak);
      window.setTimeout(() => setPopId(null), 350);
      if (nstreak >= 5) {
        setMsg("Hebat! 5 tangkapan benar — jawab 1 soal surah untuk dapat bintang dan naik level!");
        setEarnOpen(true);
      } else {
        const nt = Math.floor(Math.random() * LETTERS.length);
        setTarget(nt); setMsg(`Betul! Sekarang tangkap huruf ${LETTERS[nt].name}!`);
        spawn(nt, level);
      }
    } else {
      setClouds((cs) => cs.map((o) => (o.id === c.id ? { ...o, wrong: true } : o)));
      setMsg(`Itu huruf ${LETTERS[c.letter].name}. Cari huruf ${LETTERS[target].name} ya, awan yang lain!`);
      window.setTimeout(() => setClouds((cs) => cs.map((o) => (o.id === c.id ? { ...o, wrong: false } : o))), 600);
    }
  };

  const onBonusEarned = () => {
    setStars((s) => s + 1);
    const nl = level + 1; setLevel(nl);
    setStreak(0);
    const nt = Math.floor(Math.random() * LETTERS.length);
    setTarget(nt);
    setMsg(`Level ${nl}! Awan bergerak lebih cepat. Tangkap huruf ${LETTERS[nt].name}!`);
    spawn(nt, nl);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Tangkap Awan Hijaiyah</h1>
          <p className="text-base font-semibold text-sky-900/70">Awan huruf beterbangan di langit. Tangkap yang benar ya!</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-token">Skor {score}</span>
        <span className="chip-token">Terbaik {best}</span>
        <span className="chip-token">Level {level}</span>
        <span className="chip-token">Bintang {stars}</span>
        <span className="chip-token">Benar beruntun {streak}/5</span>
      </div>

      <div className="card-cloud p-4 text-center">
        <p className="text-base font-bold text-sky-500">Tangkap huruf…</p>
        <p className="arabic mt-1 text-sky-800" style={{ fontSize: "3rem", lineHeight: 1.3 }}>{LETTERS[target].arabic}</p>
        <p className="text-xl font-extrabold text-sky-700">{LETTERS[target].name}</p>
      </div>

      <div className="card-cloud relative overflow-hidden" style={{ height: "min(58vw, 340px)", background: "linear-gradient(180deg,#BFE6FF 0%,#EFF9FF 70%,#E3F6FF 100%)" }} role="application" aria-label="Langit dengan awan huruf hijaiyah">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="348" cy="42" r="24" fill="#FFD66E" opacity="0.9" />
          <ellipse cx="70" cy="268" rx="130" ry="34" fill="#CDEBC0" />
          <ellipse cx="330" cy="276" rx="140" ry="36" fill="#B7E3AC" />
        </svg>
        {clouds.map((c) => (
          <button key={c.id} type="button" onClick={() => tapCloud(c)} aria-label={`Awan huruf ${LETTERS[c.letter].name}`}
            className={`absolute grid place-items-center transition-transform ${c.wrong ? "shake-x opacity-60" : ""} ${popId === c.id ? "scale-150 opacity-0" : ""}`}
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: 104, height: 76, minHeight: 48, transform: popId === c.id ? "scale(1.5)" : undefined }}>
            <svg viewBox="0 0 120 84" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_8px_rgba(47,127,196,0.25)]" aria-hidden="true">
              <path d="M26,66 a15,15 0 1 1 3,-29 a20,20 0 0 1 38,-8 a17,17 0 0 1 27,10 a14,14 0 1 1 0,27 Z" fill={c.letter === target ? "#FFFFFF" : "#F4FAFF"} stroke="#7EC8F7" strokeWidth="3" />
            </svg>
            <span className="arabic relative font-bold text-sky-800" style={{ fontSize: "2rem", lineHeight: 1 }}>{LETTERS[c.letter].arabic}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{msg}</p>
      <p className="text-center text-sm font-semibold text-sky-900/60">Setiap 5 tangkapan benar, jawab 1 soal surah untuk dapat bintang dan naik level — awannya makin cepat!</p>

      <EarnSheet open={earnOpen} rewardLabel="Bintang + Naik Level" onEarn={onBonusEarned} onClose={() => setEarnOpen(false)} />
    </div>
  );
}
