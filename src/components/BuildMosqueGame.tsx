"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";
import { CloudPuppy } from "@/components/CloudPuppy";

/* Bangun Masjid Blok v2 — isometric 3D-style builder.
   SVG cubes with 3 shaded faces, stackable on an 8x6 baseplate.
   Answer-first: correct answer = +5 blocks; cubes cost 1, specials 2-3. */

type PieceType = "cube" | "dome" | "crescent" | "door" | "window" | "minaret";
interface Piece { type: PieceType; color: string }

const COLS = 8, ROWS = 6;
const TW = 58, TH = 29, CH = 26;
const OX = 320, OY = 148;
const MAX_H = 140;

const HEIGHT: Record<PieceType, number> = { cube: CH, door: CH, window: CH, dome: CH + 34, minaret: 58, crescent: 20 };
const COST: Record<PieceType, number> = { cube: 1, door: 2, window: 2, dome: 3, minaret: 3, crescent: 2 };
const COLORS = ["#7EC8F7", "#FFB7D5", "#7ED8B2", "#B79CFF", "#FFD66E", "#FFFFFF"];
const SPECIALS: { type: PieceType; name: string; color: string }[] = [
  { type: "dome", name: "Kubah", color: "#3FBFB2" },
  { type: "minaret", name: "Menara", color: "#FFFFFF" },
  { type: "door", name: "Pintu", color: "#FFF6E8" },
  { type: "window", name: "Jendela", color: "#EAF7FF" },
  { type: "crescent", name: "Bulan Sabit", color: "#FFD66E" },
];

const SAVE_KEY = "belajarngaji:v2:mosque";

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * f)));
  return `rgb(${r},${g},${b})`;
}
const proj = (x: number, y: number) => ({ px: OX + (x - y) * (TW / 2), py: OY + (x + y) * (TH / 2) });
const key = (x: number, y: number) => `${x},${y}`;

/** One isometric cube. (cx, bottomY) = centre of its bottom diamond. */
function Cube({ cx, bottomY, w = TW, h = CH, color }: { cx: number; bottomY: number; w?: number; h?: number; color: string }) {
  const th = w / 2, topY = bottomY - h;
  return (
    <g>
      <polygon points={`${cx},${topY - th / 2} ${cx + w / 2},${topY} ${cx},${topY + th / 2} ${cx - w / 2},${topY}`} fill={shade(color, 1.18)} stroke="#ffffff" strokeWidth="1" />
      <polygon points={`${cx - w / 2},${topY} ${cx},${topY + th / 2} ${cx},${bottomY} ${cx - w / 2},${bottomY - th / 2}`} fill={shade(color, 0.92)} stroke="#ffffff" strokeWidth="1" />
      <polygon points={`${cx + w / 2},${topY} ${cx},${topY + th / 2} ${cx},${bottomY} ${cx + w / 2},${bottomY - th / 2}`} fill={shade(color, 0.72)} stroke="#ffffff" strokeWidth="1" />
      {/* studs like a toy brick */}
      <ellipse cx={cx - w / 5} cy={topY - 1} rx={w / 9} ry={w / 16} fill={shade(color, 1.3)} />
      <ellipse cx={cx + w / 5} cy={topY - 1} rx={w / 9} ry={w / 16} fill={shade(color, 1.3)} />
    </g>
  );
}

function PieceArt({ piece, cx, bottomY }: { piece: Piece; cx: number; bottomY: number }) {
  const topY = bottomY - CH;
  switch (piece.type) {
    case "cube":
      return <Cube cx={cx} bottomY={bottomY} color={piece.color} />;
    case "door":
      return (<g>
        <Cube cx={cx} bottomY={bottomY} color={piece.color} />
        <path d={`M${cx - 11},${bottomY - 1} L${cx - 11},${topY + 13} Q${cx},${topY + 2} ${cx + 11},${topY + 13} L${cx + 11},${bottomY - 1} Z`} fill="#9A6B3F" stroke="#7A4E27" strokeWidth="2" />
        <circle cx={cx + 5} cy={topY + 19} r="2.2" fill="#FFD66E" />
      </g>);
    case "window":
      return (<g>
        <Cube cx={cx} bottomY={bottomY} color={piece.color} />
        <path d={`M${cx - 10},${bottomY - 4} L${cx - 10},${topY + 12} Q${cx},${topY + 3} ${cx + 10},${topY + 12} L${cx + 10},${bottomY - 4} Z`} fill="#7EC8F7" stroke="#E9B949" strokeWidth="2.4" />
        <line x1={cx} y1={topY + 7} x2={cx} y2={bottomY - 4} stroke="#E9B949" strokeWidth="2" />
      </g>);
    case "dome":
      return (<g>
        <Cube cx={cx} bottomY={bottomY} color="#FFFFFF" />
        <path d={`M${cx - 25},${topY + 2} C${cx - 25},${topY - 24} ${cx - 11},${topY - 33} ${cx},${topY - 35} C${cx + 11},${topY - 33} ${cx + 25},${topY - 24} ${cx + 25},${topY + 2} Z`} fill={piece.color} stroke={shade(piece.color, 0.75)} strokeWidth="2" />
        <path d={`M${cx - 14},${topY - 20} C${cx - 8},${topY - 27} ${cx - 3},${topY - 30} ${cx},${topY - 31}`} stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.65" />
        <line x1={cx} y1={topY - 35} x2={cx} y2={topY - 44} stroke="#E9B949" strokeWidth="3" />
        <path d={`M${cx + 5},${topY - 52} a7,7 0 1,0 4,10 a5.6,5.6 0 1,1 -4,-10 Z`} fill="#FFD66E" />
      </g>);
    case "minaret":
      return (<g>
        <Cube cx={cx} bottomY={bottomY} w={32} h={58} color={piece.color} />
        <ellipse cx={cx} cy={bottomY - 44} rx="20" ry="7" fill="#7EC8F7" stroke="#4A9BD8" strokeWidth="2" />
        <path d={`M${cx - 12},${bottomY - 48} L${cx},${bottomY - 70} L${cx + 12},${bottomY - 48} Z`} fill="#3FBFB2" stroke="#2A968B" strokeWidth="2" />
        <path d={`M${cx + 3},${bottomY - 76} a5,5 0 1,0 3,7 a4,4 0 1,1 -3,-7 Z`} fill="#FFD66E" />
        <path d={`M${cx - 6},${bottomY - 16} L${cx - 6},${bottomY - 24} Q${cx},${bottomY - 28} ${cx + 6},${bottomY - 24} L${cx + 6},${bottomY - 16} Z`} fill="#7EC8F7" />
      </g>);
    case "crescent":
      return (<g>
        <line x1={cx} y1={bottomY} x2={cx} y2={bottomY - 12} stroke="#E9B949" strokeWidth="3" />
        <path d={`M${cx + 8},${bottomY - 30} a11,11 0 1,0 6,16 a8.8,8.8 0 1,1 -6,-16 Z`} fill="#FFD66E" stroke="#E9B949" strokeWidth="1.6" />
      </g>);
  }
}

export function BuildMosqueGame() {
  const [stacks, setStacks] = useState<Record<string, Piece[]>>({});
  const [blocks, setBlocks] = useState(0);
  const [earnOpen, setEarnOpen] = useState(false);
  const [sel, setSel] = useState<{ type: PieceType; color: string }>({ type: "cube", color: COLORS[0] });
  const [eraser, setEraser] = useState(false);
  const [hint, setHint] = useState("Jawab soal untuk dapat +5 blok, lalu ketuk ubin untuk membangun!");
  const [celebrated, setCelebrated] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { stacks: Record<string, Piece[]>; blocks: number };
        if (s.stacks) setStacks(s.stacks);
        if (typeof s.blocks === "number") setBlocks(s.blocks);
      }
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify({ stacks, blocks })); } catch { /* ignore */ }
  }, [stacks, blocks]);

  const counts = useMemo(() => {
    const c: Record<PieceType, number> = { cube: 0, dome: 0, crescent: 0, door: 0, window: 0, minaret: 0 };
    Object.values(stacks).flat().forEach((p) => { c[p.type]++; });
    return c;
  }, [stacks]);
  const challengeDone = counts.dome >= 1 && counts.minaret >= 2 && counts.door >= 1;

  useEffect(() => {
    if (challengeDone && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#3FBFB2", "#ffffff"] });
      setHint("Masya Allah! Masjidmu selesai — ada kubah, dua menara, dan pintu!");
    }
    if (!challengeDone) setCelebrated(false);
  }, [challengeDone, celebrated]);

  const tapTile = (x: number, y: number) => {
    const k = key(x, y);
    const stack = stacks[k] ?? [];
    if (eraser) {
      if (stack.length === 0) return;
      setStacks((s) => ({ ...s, [k]: stack.slice(0, -1) }));
      setHint("Potongan teratas dihapus");
      return;
    }
    const usedH = stack.reduce((a, p) => a + HEIGHT[p.type], 0);
    if (stack.length >= 6 || usedH + HEIGHT[sel.type] > MAX_H) { setHint("Sudah tinggi sekali! Coba ubin lain ya"); return; }
    if (sel.type === "crescent" && stack.length === 0) { setHint("Bulan sabit ditaruh di atas bangunan — bangun dulu di bawahnya ya"); return; }
    const cost = COST[sel.type];
    if (blocks < cost) { setEarnOpen(true); setHint(`Blok kurang! Potongan ini butuh ${cost} blok — jawab soal dulu yuk`); return; }
    setBlocks((b) => b - cost);
    setStacks((s) => ({ ...s, [k]: [...stack, { type: sel.type, color: sel.color }] }));
  };

  const tiles: { x: number; y: number }[] = [];
  for (let sIdx = 0; sIdx < COLS + ROWS - 1; sIdx++)
    for (let x = 0; x < COLS; x++) { const y = sIdx - x; if (y >= 0 && y < ROWS) tiles.push({ x, y }); }

  const plateTop = proj(0, 0), plateRight = proj(COLS - 1, 0), plateBottom = proj(COLS - 1, ROWS - 1), plateLeft = proj(0, ROWS - 1);

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Bangun Masjid Blok</h1>
          <p className="text-base font-semibold text-sky-900/70">Jawab soal dulu, dapat +5 blok, lalu susun masjid 3D-mu!</p>
        </div>
      </section>

      <TokenBar balance={blocks} unit="Blok" earnLabel="Jawab untuk dapat +5 Blok" onEarnClick={() => setEarnOpen(true)} />

      {/* challenge checklist */}
      <div className="flex flex-wrap gap-2">
        <ChallengePill done={counts.dome >= 1} label="Kubah" />
        <ChallengePill done={counts.minaret >= 2} label={`Menara ${Math.min(2, counts.minaret)}/2`} />
        <ChallengePill done={counts.door >= 1} label="Pintu" />
        {challengeDone && <span className="chip-token">Masjid Selesai!</span>}
      </div>

      {/* ISO SCENE */}
      <div className="card-cloud overflow-hidden p-2">
        <svg viewBox="0 0 640 520" className="block h-auto w-full select-none" role="application" aria-label="Papan isometrik untuk membangun masjid">
          <defs>
            <linearGradient id="isoSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8ED6FF" /><stop offset="70%" stopColor="#EAF7FF" /><stop offset="100%" stopColor="#FFF3F8" />
            </linearGradient>
          </defs>
          <rect width="640" height="520" fill="url(#isoSky)" />
          <circle cx="556" cy="62" r="26" fill="#FFD66E" stroke="#F5B81E" strokeWidth="3" />
          <g className="cloud-drift">
            <ellipse cx="110" cy="64" rx="42" ry="18" fill="#fff" /><ellipse cx="140" cy="54" rx="28" ry="15" fill="#fff" />
            <ellipse cx="430" cy="40" rx="34" ry="14" fill="#fff" opacity="0.9" />
          </g>
          <path d="M0,470 Q120,430 260,462 T640,452 L640,520 L0,520 Z" fill="#B7EDD2" />
          <path d="M0,492 Q180,462 360,488 T640,482 L640,520 L0,520 Z" fill="#8FE0B8" />

          {/* plate thickness */}
          <polygon points={`${plateRight.px + TW / 2},${plateRight.py} ${plateBottom.px},${plateBottom.py + TH / 2} ${plateBottom.px},${plateBottom.py + TH / 2 + 18} ${plateRight.px + TW / 2},${plateRight.py + 18}`} fill="#D9A05F" />
          <polygon points={`${plateLeft.px - TW / 2},${plateLeft.py} ${plateBottom.px},${plateBottom.py + TH / 2} ${plateBottom.px},${plateBottom.py + TH / 2 + 18} ${plateLeft.px - TW / 2},${plateLeft.py + 18}`} fill="#B97F3E" />
          <polygon points={`${plateTop.px},${plateTop.py - TH / 2} ${plateRight.px + TW / 2},${plateRight.py} ${plateBottom.px},${plateBottom.py + TH / 2} ${plateLeft.px - TW / 2},${plateLeft.py}`} fill="#FFF9EC" />

          {/* tiles */}
          {tiles.map(({ x, y }) => {
            const { px, py } = proj(x, y);
            return (<polygon key={`t${x}-${y}`} points={`${px},${py - TH / 2} ${px + TW / 2},${py} ${px},${py + TH / 2} ${px - TW / 2},${py}`} fill={(x + y) % 2 === 0 ? "#FFF3D6" : "#FFE9BC"} stroke="#EBCB8B" strokeWidth="1" />);
          })}

          {/* stacks back-to-front */}
          {tiles.map(({ x, y }) => {
            const stack = stacks[key(x, y)] ?? [];
            const { px, py } = proj(x, y);
            let cum = 0;
            return (
              <g key={`s${x}-${y}`}>
                {stack.map((piece, i) => {
                  const bottomY = py - cum;
                  cum += HEIGHT[piece.type];
                  return <g key={i} className="pop-place"><PieceArt piece={piece} cx={px} bottomY={bottomY} /></g>;
                })}
              </g>
            );
          })}

          {/* click layer at stack tops */}
          {tiles.map(({ x, y }) => {
            const stack = stacks[key(x, y)] ?? [];
            const { px, py } = proj(x, y);
            const topOff = stack.reduce((a, p) => a + HEIGHT[p.type], 0);
            const cy = py - topOff;
            return (
              <polygon key={`c${x}-${y}`} points={`${px},${cy - TH / 2} ${px + TW / 2},${cy} ${px},${cy + TH / 2} ${px - TW / 2},${cy}`}
                fill="transparent" style={{ cursor: "pointer" }} onClick={() => tapTile(x, y)}>
                <title>{`Ubin ${x + 1},${y + 1}`}</title>
              </polygon>
            );
          })}
        </svg>
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>

      {/* palette */}
      <div className="card-cloud p-4">
        <p className="text-base font-extrabold text-sky-800">Blok Warna <span className="font-bold text-pink-500">(1 blok)</span></p>
        <div className="tray-scroll no-scrollbar">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => { setSel({ type: "cube", color: c }); setEraser(false); }}
              className={`rounded-3xl border-[3px] p-1.5 shadow-sm transition active:scale-95 ${!eraser && sel.type === "cube" && sel.color === c ? "border-sky-500 ring-4 ring-sky-200" : "border-white bg-white"}`}>
              <svg viewBox="-32 -34 64 68" className="h-14 w-14" aria-hidden="true"><Cube cx={0} bottomY={16} w={52} h={24} color={c} /></svg>
            </button>
          ))}
        </div>
        <p className="mt-1 text-base font-extrabold text-sky-800">Potongan Istimewa</p>
        <div className="tray-scroll no-scrollbar">
          {SPECIALS.map((sp) => (
            <button key={sp.type} type="button" onClick={() => { setSel({ type: sp.type, color: sp.color }); setEraser(false); }}
              className={`flex w-24 flex-col items-center rounded-3xl border-[3px] bg-sky-50 p-1.5 shadow-sm transition active:scale-95 ${!eraser && sel.type === sp.type ? "border-pink-400 ring-4 ring-pink-200" : "border-white"}`}>
              <svg viewBox="-34 -78 68 96" className="h-14 w-14" aria-hidden="true"><PieceArt piece={{ type: sp.type, color: sp.color }} cx={0} bottomY={14} /></svg>
              <span className="text-[13px] font-extrabold leading-tight text-sky-900">{sp.name}</span>
              <span className="text-[12px] font-bold text-pink-500">{COST[sp.type]} blok</span>
            </button>
          ))}
          <button type="button" onClick={() => setEraser(true)}
            className={`flex w-24 flex-col items-center justify-center rounded-3xl border-[3px] bg-white p-1.5 shadow-sm transition active:scale-95 ${eraser ? "border-rose-400 ring-4 ring-rose-200" : "border-white"}`}>
            <svg viewBox="-20 -20 40 40" className="h-14 w-14" aria-hidden="true">
              <path d="M-12,10 L4,-8 a5,5 0 0,1 7,0 l3,3 a5,5 0 0,1 0,7 L2,10 Z" fill="#FFB7D5" stroke="#E7548F" strokeWidth="2.4" />
              <line x1="-14" y1="14" x2="16" y2="14" stroke="#E7548F" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] font-extrabold text-sky-900">Penghapus</span>
            <span className="text-[12px] font-bold text-sky-500">gratis</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-candy flex-1"
          onClick={() => confetti({ particleCount: 160, spread: 110, origin: { y: 0.45 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#3FBFB2"] })}>
          Rayakan Masjidku
        </button>
        <button type="button" className="btn-candy btn-candy-white flex-1"
          onClick={() => { setStacks({}); setHint("Papan dibersihkan — ayo bangun lagi!"); }}>
          Bersihkan Papan
        </button>
      </div>

      <EarnSheet open={earnOpen} rewardLabel="+5 Blok" onEarn={() => setBlocks((b) => b + 5)} onClose={() => setEarnOpen(false)} />
    </div>
  );
}

function ChallengePill({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] px-4 text-base font-extrabold shadow ${done ? "border-emerald-300 bg-emerald-100 text-emerald-700" : "border-white bg-white/85 text-sky-800"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-sm text-white ${done ? "bg-emerald-400" : "bg-sky-300"}`}>{done ? "✓" : "•"}</span>
      {label}
    </span>
  );
}
