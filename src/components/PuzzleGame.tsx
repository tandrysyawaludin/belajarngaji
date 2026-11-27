"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";

const KEY = "belajarngaji:v2:puzzle-best";

/** The complete picture: a pretty mosque at sunset, drawn once and sliced into tiles. */
export function MosqueScene() {
  return (
    <svg viewBox="0 0 300 300" className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="pzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD9A0" /><stop offset="45%" stopColor="#FFB7D5" /><stop offset="78%" stopColor="#BFE6FF" /><stop offset="100%" stopColor="#EFF9FF" /></linearGradient>
        <linearGradient id="pzDome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7FE3D4" /><stop offset="100%" stopColor="#2AA79B" /></linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#pzSky)" />
      <circle cx="150" cy="196" r="42" fill="#FFCF5C" />
      <circle cx="150" cy="196" r="56" fill="#FFD66E" opacity="0.3" />
      <path d="M52,44 l2.4,5.6 5.6,2.4 -5.6,2.4 -2.4,5.6 -2.4,-5.6 -5.6,-2.4 5.6,-2.4Z" fill="#fff" opacity="0.9" />
      <path d="M248,30 l2,4.6 4.6,2 -4.6,2 -2,4.6 -2,-4.6 -4.6,-2 4.6,-2Z" fill="#fff" opacity="0.8" />
      <path d="M150,18 a10,10 0 1 0 4,19 a8,8 0 1 1 -4,-19Z" fill="#FFF3C4" />
      {/* ground */}
      <rect x="0" y="238" width="300" height="62" fill="#8FD694" />
      <path d="M0,238 Q75,224 150,238 T300,238 V300 H0Z" fill="#A5E3A1" />
      {/* minarets */}
      {[58, 226].map((x) => (
        <g key={x}>
          <rect x={x} y="128" width="16" height="112" rx="5" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="2" />
          <rect x={x - 4} y="152" width="24" height="10" rx="5" fill="#7EC8F7" />
          <path d={`M${x - 3},128 L${x + 8},100 L${x + 19},128Z`} fill="url(#pzDome)" />
          <circle cx={x + 8} cy="97" r="3" fill="#FFD66E" />
          <rect x={x + 4} y="182" width="8" height="14" rx="4" fill="#FFB7D5" />
        </g>
      ))}
      {/* main building */}
      <rect x="92" y="168" width="116" height="72" rx="8" fill="#FFFFFF" stroke="#D6F0FF" strokeWidth="2" />
      <rect x="84" y="158" width="132" height="14" rx="7" fill="#7EC8F7" />
      {/* dome */}
      <path d="M150,84 C118,84 106,116 104,158 L196,158 C194,116 182,84 150,84Z" fill="url(#pzDome)" />
      <rect x="146" y="66" width="8" height="20" rx="4" fill="#FFD66E" />
      <path d="M156,52 a8,8 0 1 0 3,15 a6.4,6.4 0 1 1 -3,-15Z" fill="#FFD66E" />
      {/* door + windows */}
      <path d="M136,240 v-34 a14,14 0 0 1 28,0 v34Z" fill="#B5793B" />
      <circle cx="158" cy="224" r="2.6" fill="#FFD66E" />
      {[106, 178].map((x) => (<path key={x} d={`M${x},206 v-16 a8,8 0 0 1 16,0 v16Z`} fill="#FFE9A8" stroke="#FFD66E" strokeWidth="2" />))}
      {/* garden */}
      {[30, 262, 44, 246].map((x, i) => (<g key={i} transform={`translate(${x} 262)`}><circle r="9" fill="#3FBFB2" /><rect x="-2" y="6" width="4" height="12" fill="#8A5A33" /></g>))}
      {[86, 214].map((x, i) => (<g key={i} transform={`translate(${x} 252)`}>{[0, 72, 144, 216, 288].map((a) => (<circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5} cy={Math.sin((a * Math.PI) / 180) * 5} r="4" fill="#FF8FBF" />))}<circle r="3" fill="#FFD66E" /></g>))}
      <path d="M110,286 q40,-10 80,0" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function shuffled(): number[] {
  const a = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  do { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } while (a.every((v, i) => v === i));
  return a;
}

export function PuzzleGame() {
  const [tokens, setTokens] = useState(0);
  const [order, setOrder] = useState<number[]>(() => [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [sel, setSel] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [earnOpen, setEarnOpen] = useState(false);
  const [hint, setHint] = useState("Ketuk satu potongan, lalu ketuk potongan lain untuk menukar tempatnya (1 token per tukar).");
  /* The board must NEVER be seen solved: tiles render only after the
     scramble has been applied on mount (ready gate). */
  const [ready, setReady] = useState(false);
  const [peek, setPeek] = useState(false);
  const [sparkPos, setSparkPos] = useState<number[]>([]);

  useEffect(() => {
    setOrder(shuffled());
    try { const b = Number(localStorage.getItem(KEY)); if (b > 0) setBest(b); } catch { /* ignore */ }
    setReady(true);
  }, []);

  const correctCount = order.reduce((a, v, i) => a + (v === i ? 1 : 0), 0);

  const tapTile = (pos: number) => {
    if (won) return;
    if (sel === null) { setSel(pos); setHint("Bagus, sekarang ketuk potongan lain untuk menukar!"); return; }
    if (sel === pos) { setSel(null); return; }
    if (tokens < 1) { setEarnOpen(true); setHint("Token tukar habis — jawab soal dulu yuk!"); return; }
    setTokens((v) => v - 1);
    const next = [...order]; [next[sel], next[pos]] = [next[pos], next[sel]];
    setOrder(next); setSel(null);
    const ns = swaps + 1; setSwaps(ns);
    if (next.every((v, i) => v === i)) {
      setWon(true);
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ["#FF8FBF", "#7EC8F7", "#FFD66E", "#3FBFB2", "#ffffff"] });
      if (best === null || ns < best) { setBest(ns); try { localStorage.setItem(KEY, String(ns)); } catch { /* ignore */ } }
    } else {
      // Progress feedback: celebrate any tile this swap landed home.
      const landed = [sel, pos].filter((p) => next[p] === p);
      if (landed.length > 0) {
        setSparkPos(landed);
        window.setTimeout(() => setSparkPos([]), 800);
        setHint(landed.length === 2 ? "Dua potongan pas! 🎉" : "Satu potongan pas! 🎉");
      } else setHint(`${ns} kali tukar. Teruskan sampai gambarnya utuh!`);
    }
  };

  const again = () => { setOrder(shuffled()); setSel(null); setSwaps(0); setWon(false); setSparkPos([]); setHint("Gambar diacak lagi! Yuk susun kembali."); };

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Puzzle Masjid Cantik</h1>
          <p className="text-base font-semibold text-sky-900/70">Susun kembali gambar masjid saat matahari terbenam!</p>
        </div>
      </section>

      <TokenBar balance={tokens} unit="Token Tukar" earnLabel="Jawab untuk dapat Token" onEarnClick={() => setEarnOpen(true)} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-token">Tukar: {swaps} kali</span>
        <span className="chip-token">Potongan benar: {correctCount}/9</span>
        {best !== null && <span className="chip-token">Terbaik: {best} tukar</span>}
        <button
          type="button"
          className="btn-candy btn-candy-white ml-auto min-h-12 touch-none px-5 select-none"
          onPointerDown={() => setPeek(true)}
          onPointerUp={() => setPeek(false)}
          onPointerLeave={() => setPeek(false)}
          onPointerCancel={() => setPeek(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          Tahan untuk Lihat Gambar
        </button>
      </div>

      <div className="card-cloud mx-auto w-full max-w-[430px] p-2">
        {!ready ? (
          <div className="grid aspect-square place-items-center rounded-[1.6rem] bg-sky-50">
            <p className="text-lg font-extrabold text-sky-600">Mengacak gambar… 🎲</p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[1.6rem]">
            {/* ghost guide: the complete picture at 18% behind the tiles */}
            <div className="absolute inset-0 opacity-[0.18]"><MosqueScene /></div>
            <div className="relative grid grid-cols-3 gap-1.5 p-1.5">
              {order.map((piece, pos) => {
                const col = piece % 3, row = Math.floor(piece / 3);
                return (
                  <button key={pos} type="button" onClick={() => tapTile(pos)} aria-label={`Potongan ${pos + 1}`}
                    className={`relative aspect-square min-h-12 overflow-hidden rounded-2xl shadow transition active:scale-95 ${sel === pos ? "ring-4 ring-pink-400 scale-[1.03] z-10" : "ring-2 ring-white/80"}`}>
                    <div className="absolute" style={{ width: "300%", height: "300%", left: `${-col * 100}%`, top: `${-row * 100}%` }}>
                      <MosqueScene />
                    </div>
                    {sparkPos.includes(pos) && (
                      <span className="pop-place pointer-events-none absolute inset-0 z-10 grid place-items-center">
                        <svg viewBox="0 0 24 24" className="h-10 w-10 drop-shadow"><path d="M12,1 l3.2,7.6 7.8,2.4 -7.8,2.4 L12,21 l-3.2,-7.6 L1,13.4 8.8,11 Z" fill="#FFD66E" stroke="#fff" strokeWidth="1.4" transform="rotate(90 12 12)" /></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* hold-to-peek: full picture at full opacity while pressed */}
            {peek && (
              <div className="pointer-events-none absolute inset-0 z-20">
                <MosqueScene />
              </div>
            )}
          </div>
        )}
      </div>

      {won ? (
        <div className="card-cloud pop-place p-5 text-center">
          <p className="text-2xl font-extrabold text-sky-700">Masya Allah! Gambarnya utuh!</p>
          <p className="mt-1 text-base font-semibold text-sky-900/70">Kamu menyelesaikannya dengan {swaps} kali tukar.</p>
          <button type="button" className="btn-candy btn-candy-pink mt-4 min-h-12 px-6" onClick={again}>Acak & Main Lagi</button>
        </div>
      ) : (
        <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>
      )}

      <EarnSheet open={earnOpen} rewardLabel="+1 Token Tukar" onEarn={() => setTokens((v) => v + 1)} onClose={() => setEarnOpen(false)} />
    </div>
  );
}
