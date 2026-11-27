"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";
import { CloudPuppy } from "@/components/CloudPuppy";

/* Dekorasi Kamar Ngaji v2 — perspective room, hand-drawn SVG furniture,
   pointer-drag decorating. Answer-first: 1 token per new item / wallpaper. */

type Kind = "sajjadah" | "rehal" | "lamp" | "shelf" | "frame" | "plant" | "teddy" | "cushion" | "table" | "lights";

interface Placed { uid: number; kind: Kind; x: number; y: number }
interface WallDef { name: string; a: string; b: string }

const WALLS: WallDef[] = [
  { name: "Langit", a: "#D6F0FF", b: "#AEE3FF" },
  { name: "Permen", a: "#FFE3F0", b: "#FFC7DE" },
  { name: "Mint", a: "#DFF9EC", b: "#B7EDD2" },
  { name: "Lilac", a: "#EFE7FF", b: "#D9C8FF" },
  { name: "Krim", a: "#FFF6DC", b: "#FFE9A8" },
];

const ITEMS: { kind: Kind; name: string; s: number }[] = [
  { kind: "sajjadah", name: "Sajjadah", s: 1.25 },
  { kind: "rehal", name: "Rehal & Qur'an", s: 1 },
  { kind: "lamp", name: "Lampu Bulan", s: 1 },
  { kind: "shelf", name: "Rak Buku", s: 1 },
  { kind: "frame", name: "Kaligrafi", s: 1 },
  { kind: "plant", name: "Tanaman", s: 1 },
  { kind: "teddy", name: "Boneka Beruang", s: 1 },
  { kind: "cushion", name: "Bantal Awan", s: 1 },
  { kind: "table", name: "Meja Bunga", s: 1 },
  { kind: "lights", name: "Lampu Bintang", s: 1.15 },
];

const STARTER: Placed[] = [
  { uid: 1, kind: "teddy", x: 400, y: 500 },
  { uid: 2, kind: "plant", x: 96, y: 470 },
  { uid: 3, kind: "cushion", x: 640, y: 500 },
];

/* How far each item's art reaches from its floor-contact origin (unscaled
   SVG units): l/r = sideways, t = above origin, b = below origin. Used to
   clamp positions so the WHOLE item always stays inside the room. */
const ART: Record<Kind, { l: number; r: number; t: number; b: number }> = {
  sajjadah: { l: 78, r: 78, t: 30, b: 2 },
  rehal: { l: 44, r: 44, t: 56, b: 2 },
  lamp: { l: 54, r: 54, t: 148, b: 7 },
  shelf: { l: 52, r: 52, t: 149, b: 2 },
  frame: { l: 56, r: 56, t: 114, b: 0 },
  plant: { l: 40, r: 40, t: 96, b: 2 },
  teddy: { l: 39, r: 39, t: 99, b: 2 },
  cushion: { l: 66, r: 66, t: 54, b: 8 },
  table: { l: 52, r: 52, t: 96, b: 2 },
  lights: { l: 90, r: 90, t: 78, b: 0 },
};

const ROOM_W = 800, ROOM_H = 560;
/** Trash zone (SVG coords) — the labelled cloud bin, bottom-right. */
const TRASH = { x1: 636, y1: 424, x2: 800, y2: 560 };

function clampPos(kind: Kind, x: number, y: number): { x: number; y: number } {
  const s = ITEMS.find((d) => d.kind === kind)?.s ?? 1;
  const a = ART[kind];
  return {
    x: Math.max(a.l * s + 4, Math.min(ROOM_W - a.r * s - 4, x)),
    y: Math.max(a.t * s + 4, Math.min(ROOM_H - a.b * s - 4, y)),
  };
}

const SAVE_KEY = "belajarngaji:v2:room";
let uidSeq = 100;

/** Hand-drawn furniture. Origin = floor contact point, art goes up (-y). */
function ItemArt({ kind }: { kind: Kind }) {
  switch (kind) {
    case "sajjadah":
      return (
        <g>
          <polygon points="-78,0 -52,-30 52,-30 78,0" fill="#2AA5A0" stroke="#1D7A76" strokeWidth="3" />
          <polygon points="-62,-4 -42,-24 42,-24 62,-4" fill="#7FD8CF" />
          <path d="M-20,-6 L-20,-16 Q0,-26 20,-16 L20,-6" fill="none" stroke="#FFF3C4" strokeWidth="3.5" />
          <circle cx="0" cy="-10" r="3.5" fill="#FFD66E" />
          <path d="M-52,-27 l-6,5 M52,-27 l6,5" stroke="#FFB7D5" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "rehal":
      return (
        <g>
          <path d="M-34,0 L18,-52 M34,0 L-18,-52" stroke="#9A6B3F" strokeWidth="9" strokeLinecap="round" />
          <path d="M-40,-46 Q-20,-58 0,-48 L0,-24 Q-20,-34 -40,-26 Z" fill="#FFFFFF" stroke="#5EB2F2" strokeWidth="3" />
          <path d="M40,-46 Q20,-58 0,-48 L0,-24 Q20,-34 40,-26 Z" fill="#F4FAFF" stroke="#5EB2F2" strokeWidth="3" />
          <path d="M-32,-40 q10,-5 24,-1 M-32,-33 q10,-5 24,-1 M8,-41 q10,-4 24,1 M8,-34 q10,-4 24,1" stroke="#7EC8F7" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <rect x="-44" y="-56" width="88" height="8" rx="4" fill="#C98F5A" />
        </g>
      );
    case "lamp":
      return (
        <g>
          <ellipse cx="0" cy="-96" rx="52" ry="52" fill="#FFD66E" opacity="0.22" />
          <rect x="-26" y="-6" width="52" height="7" rx="3.5" fill="#8A5A33" />
          <rect x="-4" y="-72" width="8" height="68" fill="#B07B45" />
          <path d="M30,-128 a30,30 0 1,0 18,52 a24,24 0 1,1 -18,-52 Z" fill="#FFD66E" stroke="#F5B81E" strokeWidth="3" transform="translate(-16 6)" />
          <path d="M26,-96 l3.4,7.4 7.4,3.4 -7.4,3.4 -3.4,7.4 -3.4,-7.4 -7.4,-3.4 7.4,-3.4 Z" fill="#FFB7D5" className="sparkle" />
        </g>
      );
    case "shelf":
      return (
        <g>
          <rect x="-52" y="-132" width="104" height="132" rx="8" fill="#C98F5A" stroke="#9A6B3F" strokeWidth="4" />
          <rect x="-44" y="-124" width="88" height="34" fill="#FFF7EA" />
          <rect x="-44" y="-84" width="88" height="34" fill="#FFF7EA" />
          <rect x="-44" y="-44" width="88" height="36" fill="#FFF7EA" />
          {[-38, -24, -8, 8, 24].map((x, i) => (
            <rect key={i} x={x} y={-120 + (i % 2) * 3} width="10" height="28" rx="2" fill={["#FF8FBF", "#5EB2F2", "#FFD66E", "#7ED491", "#B79CFF"][i]} />
          ))}
          {[-36, -18, 2, 20].map((x, i) => (
            <rect key={i} x={x} y="-80" width="11" height="28" rx="2" fill={["#7EC8F7", "#FFB7D5", "#FFC46E", "#5ED0C5"][i]} />
          ))}
          <circle cx="-24" cy="-58" r="11" fill="#FFD66E" />
          <path d="M-24,-66 v6 M-30,-60 h12" stroke="#F5B81E" strokeWidth="2.4" />
          <rect x="8" y="-40" width="26" height="30" rx="3" fill="#5EB2F2" />
          <path d="M14,-34 q7,-6 14,0 M14,-27 q7,-6 14,0" stroke="#fff" strokeWidth="2.2" fill="none" />
          <circle cx="0" cy="-140" r="9" fill="#7ED491" />
          <path d="M0,-132 v-8 M-6,-146 q6,-6 10,-1 M6,-146 q-6,-6 -10,-1" stroke="#3E9B4F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "frame":
      return (
        <g>
          <rect x="-46" y="-104" width="92" height="76" rx="10" fill="#FFE9A8" stroke="#B8860B" strokeWidth="7" />
          <rect x="-34" y="-92" width="68" height="52" rx="6" fill="#EFF9FF" />
          <text x="0" y="-52" textAnchor="middle" fontSize="34" fill="#2F7FC4" style={{ fontFamily: "var(--font-arabic), serif" }}>الله</text>
          <path d="M-46,-104 l10,-10 M46,-104 l-10,-10" stroke="#FFB7D5" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "plant":
      return (
        <g>
          <path d="M0,-34 C-34,-44 -40,-78 -30,-96 C-12,-88 -4,-66 0,-48 C4,-66 12,-88 30,-96 C40,-78 34,-44 0,-34Z" fill="#5FBF73" />
          <path d="M0,-34 C-18,-52 -20,-74 -12,-88 M0,-34 C18,-52 20,-74 12,-88" stroke="#3E9B4F" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M-24,-2 L24,-2 L18,-38 L-18,-38 Z" fill="#E8875B" stroke="#C9663F" strokeWidth="3" />
          <rect x="-27" y="-44" width="54" height="9" rx="4" fill="#C9663F" />
          <circle cx="-8" cy="-20" r="3" fill="#FFD3B8" /><circle cx="10" cy="-14" r="3" fill="#FFD3B8" />
        </g>
      );
    case "teddy":
      return (
        <g>
          <circle cx="-26" cy="-86" r="13" fill="#B07B45" /><circle cx="26" cy="-86" r="13" fill="#B07B45" />
          <circle cx="-26" cy="-86" r="6.5" fill="#EBC79B" /><circle cx="26" cy="-86" r="6.5" fill="#EBC79B" />
          <ellipse cx="0" cy="-34" rx="30" ry="34" fill="#C98F5A" />
          <ellipse cx="0" cy="-28" rx="17" ry="21" fill="#F3DFC0" />
          <circle cx="0" cy="-72" r="27" fill="#C98F5A" />
          <ellipse cx="0" cy="-64" rx="12" ry="9" fill="#F3DFC0" />
          <circle cx="-10" cy="-78" r="3.4" fill="#3A2A1A" /><circle cx="10" cy="-78" r="3.4" fill="#3A2A1A" />
          <ellipse cx="0" cy="-68" rx="4.6" ry="3.4" fill="#3A2A1A" />
          <path d="M0,-64 q0,5 -6,6 M0,-64 q0,5 6,6" stroke="#3A2A1A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="-18" cy="-58" rx="6" ry="4" fill="#FFB7D5" /><ellipse cx="18" cy="-58" rx="6" ry="4" fill="#FFB7D5" />
          <path d="M-8,-46 L8,-46 L0,-34 Z" fill="#FF8FBF" />
          <circle cx="-30" cy="-12" r="9" fill="#B07B45" /><circle cx="30" cy="-12" r="9" fill="#B07B45" />
        </g>
      );
    case "cushion":
      return (
        <g>
          <path d="M-38,-8 a20,20 0 0,1 6,-38 a24,24 0 0,1 42,-8 a20,20 0 0,1 20,20 a18,18 0 0,1 -8,26 l-52,0 a18,18 0 0,1 -8,-16 Z" fill="#FFFFFF" stroke="#BFE6FF" strokeWidth="4" transform="translate(-14 8)" />
          <circle cx="-16" cy="-24" r="3.2" fill="#23405E" /><circle cx="14" cy="-24" r="3.2" fill="#23405E" />
          <path d="M-6,-14 q6,6 12,0" stroke="#23405E" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="-26" cy="-16" rx="6" ry="4" fill="#FFB7D5" /><ellipse cx="24" cy="-16" rx="6" ry="4" fill="#FFB7D5" />
        </g>
      );
    case "table":
      return (
        <g>
          <rect x="-5" y="-46" width="10" height="46" fill="#9A6B3F" />
          <ellipse cx="0" cy="-48" rx="52" ry="12" fill="#EBC79B" stroke="#C98F5A" strokeWidth="3" />
          <path d="M-10,-58 h20 l-3,-20 h-14 Z" fill="#7EC8F7" />
          <circle cx="-8" cy="-84" r="7" fill="#FF8FBF" /><circle cx="6" cy="-88" r="8" fill="#FFB7D5" /><circle cx="16" cy="-80" r="6" fill="#FFD66E" />
          <path d="M-4,-78 q-8,-8 -14,-6 M6,-78 q2,-10 10,-12" stroke="#3E9B4F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "lights":
      return (
        <g>
          <path d="M-90,-78 Q0,-48 90,-78" fill="none" stroke="#8A6D4A" strokeWidth="3" />
          {[-68, -34, 0, 34, 68].map((x, i) => {
            const y = -66 - Math.abs(x) * 0.12 + (i % 2) * 4;
            const c = ["#FFD66E", "#FF8FBF", "#7EC8F7", "#7ED491", "#FFB7D5"][i];
            return (
              <g key={i}>
                <line x1={x} y1={y - 8} x2={x} y2={y} stroke="#8A6D4A" strokeWidth="2.4" />
                <circle cx={x} cy={y + 8} r="12" fill={c} opacity="0.3" />
                <path d={`M${x},${y} l3.4,7.4 7.4,3.4 -7.4,3.4 -3.4,7.4 -3.4,-7.4 -7.4,-3.4 7.4,-3.4 Z`} fill={c} className="sparkle" />
              </g>
            );
          })}
        </g>
      );
  }
}

export function DecorateGame() {
  const [items, setItems] = useState<Placed[]>(STARTER);
  const [wall, setWall] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [earnOpen, setEarnOpen] = useState(false);
  const [armed, setArmed] = useState<Kind | null>(null);
  const [dragUid, setDragUid] = useState<number | null>(null);
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [poof, setPoof] = useState<{ x: number; y: number; k: number } | null>(null);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ uid: number; dx: number; dy: number; downX: number; downY: number; moved: boolean } | null>(null);
  /* Guards so ONE tray tap can never produce TWO items: a room tap only
     places if the item was armed by an earlier, separate tap, and only
     once per arming. */
  const armedAt = useRef(0);
  const placeLock = useRef(0);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { items: Placed[]; wall: number; tokens: number };
        if (Array.isArray(s.items)) setItems(s.items);
        if (typeof s.wall === "number") setWall(s.wall);
        if (typeof s.tokens === "number") setTokens(s.tokens);
      }
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify({ items, wall, tokens })); } catch { /* ignore */ }
  }, [items, wall, tokens]);

  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 800, y: ((e.clientY - r.top) / r.height) * 560 };
  };

  const tapTray = (kind: Kind) => {
    // Selecting ONLY arms the item — nothing is placed and no token is
    // spent until she taps the room (see onRoomDown).
    if (tokens < 1) { setEarnOpen(true); setHint("Jawab dulu untuk dapat token ya!"); return; }
    armedAt.current = Date.now();
    setArmed(kind);
    setSelectedUid(null);
    setHint("Sekarang ketuk tempat di kamar untuk menaruhnya");
  };

  const onRoomDown = (e: React.PointerEvent) => {
    if (!armed) return;
    const now = Date.now();
    // Ignore the tail of the same tap that armed the item, and any repeat
    // fire right after a placement — one arming = one item = one token.
    if (now - armedAt.current < 200 || now - placeLock.current < 400) return;
    placeLock.current = now;
    const kind = armed;
    const pt = clampPos(kind, toSvg(e).x, toSvg(e).y);
    setItems((it) => [...it, { uid: ++uidSeq, kind, x: pt.x, y: pt.y }]);
    setTokens((t) => t - 1);
    setArmed(null);
    setHint("Cantik! Seret barangnya kalau mau dipindah");
  };

  const onItemDown = (e: React.PointerEvent, it: Placed) => {
    e.stopPropagation();
    const pt = toSvg(e);
    dragRef.current = { uid: it.uid, dx: pt.x - it.x, dy: pt.y - it.y, downX: pt.x, downY: pt.y, moved: false };
    setDragUid(it.uid);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const pt = toSvg(e);
    if (Math.abs(pt.x - d.downX) + Math.abs(pt.y - d.downY) > 8) d.moved = true;
    setItems((arr) => arr.map((it) => {
      if (it.uid !== d.uid) return it;
      const p = clampPos(it.kind, pt.x - d.dx, pt.y - d.dy);
      return { ...it, x: p.x, y: p.y };
    }));
  };

  const deleteItem = (uid: number, at?: { x: number; y: number }) => {
    const it = items.find((i) => i.uid === uid);
    setItems((arr) => arr.filter((i) => i.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
    if (it) {
      setPoof({ x: at?.x ?? it.x, y: (at?.y ?? it.y) - 40, k: Date.now() });
      window.setTimeout(() => setPoof(null), 550);
    }
    setHint("Sudah dibuang");
  };

  const onUp = () => {
    const d = dragRef.current;
    if (d) {
      // Drop detection uses the ITEM's centre (its origin), not the raw
      // pointer, so it matches what she sees under her finger.
      const it = items.find((i) => i.uid === d.uid);
      if (it && d.moved && it.x >= TRASH.x1 && it.x <= TRASH.x2 && it.y >= TRASH.y1 && it.y <= TRASH.y2) {
        deleteItem(d.uid, { x: it.x, y: it.y });
      } else if (it && !d.moved) {
        // A simple tap on an item selects it (shows the Buang button).
        setSelectedUid(d.uid);
        setHint("Barang dipilih. Ketuk Buang untuk membuangnya, atau seret untuk memindah.");
      }
    }
    dragRef.current = null;
    setDragUid(null);
  };

  const applyWall = (i: number) => {
    if (i === wall) return;
    if (tokens < 1) { setEarnOpen(true); setHint("Ganti warna dinding butuh 1 token — jawab dulu yuk!"); return; }
    setWall(i); setTokens((t) => t - 1);
  };

  const finish = () => {
    confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
    setDone(true);
  };

  const w = WALLS[wall];

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Dekorasi Kamar Ngaji</h1>
          <p className="text-base font-semibold text-sky-900/70">Jawab soal dulu, dapat token, lalu hias kamarmu sesukamu!</p>
        </div>
      </section>

      <TokenBar balance={tokens} unit="Token" earnLabel="Jawab untuk dapat Token" onEarnClick={() => setEarnOpen(true)} />

      <div className="card-cloud overflow-hidden p-2">
        <svg
          ref={svgRef}
          viewBox="0 0 800 560"
          className="block h-auto w-full touch-none select-none"
          role="application"
          aria-label="Kamar untuk didekorasi"
          onPointerDown={onRoomDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        >
          <defs>
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={w.a} /><stop offset="100%" stopColor={w.b} />
            </linearGradient>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9A05F" /><stop offset="100%" stopColor="#B97F3E" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7EC8F7" /><stop offset="100%" stopColor="#EAF7FF" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="800" height="386" fill="url(#wallGrad)" />
          <polygon points="800,0 800,386 736,386 736,0" fill="#00000010" />
          <circle cx="700" cy="52" r="4" fill="#fff" className="sparkle" />
          <circle cx="52" cy="40" r="3" fill="#fff" className="sparkle" />
          <polygon points="0,386 800,386 800,560 0,560" fill="url(#floorGrad)" />
          {[430, 478, 528].map((y) => (<line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#9A6B3F" strokeWidth="2" opacity="0.5" />))}
          {[140, 300, 500, 660].map((x) => (<line key={x} x1={x} y1="386" x2={x - 60} y2="560" stroke="#9A6B3F" strokeWidth="2" opacity="0.35" />))}
          <rect x="0" y="372" width="800" height="14" fill="#FFFFFF" opacity="0.9" />

          <g>
            <rect x="86" y="58" width="218" height="212" rx="16" fill="url(#skyGrad)" stroke="#FFFFFF" strokeWidth="12" />
            <g className="cloud-drift">
              <ellipse cx="150" cy="110" rx="34" ry="16" fill="#fff" /><ellipse cx="176" cy="102" rx="24" ry="14" fill="#fff" />
              <ellipse cx="248" cy="180" rx="28" ry="13" fill="#fff" opacity="0.9" />
            </g>
            <circle cx="262" cy="94" r="17" fill="#FFD66E" stroke="#F5B81E" strokeWidth="3" />
            <line x1="195" y1="58" x2="195" y2="270" stroke="#fff" strokeWidth="8" />
            <line x1="86" y1="164" x2="304" y2="164" stroke="#fff" strokeWidth="8" />
            <path d="M78,48 q30,110 6,226 l44,0 q-16,-110 -6,-226 Z" fill="#FFB7D5" opacity="0.95" />
            <path d="M312,48 q-30,110 -6,226 l-44,0 q16,-110 6,-226 Z" fill="#FFB7D5" opacity="0.95" />
            <rect x="70" y="268" width="250" height="14" rx="7" fill="#fff" />
            <rect x="70" y="40" width="250" height="12" rx="6" fill="#E9B949" />
          </g>

          <g transform="translate(520 66)"><ItemArt kind="lights" /></g>

          {[...items].sort((a, b) => a.y - b.y).map((it) => {
            const s = ITEMS.find((d) => d.kind === it.kind)?.s ?? 1;
            return (
              <g
                key={it.uid}
                transform={`translate(${it.x} ${it.y}) scale(${s})`}
                                style={{ cursor: "grab", touchAction: "none", pointerEvents: armed ? "none" : "auto" }}
                onPointerDown={(e) => onItemDown(e, it)}
              >
                <g className={dragUid === it.uid ? undefined : "pop-place"}><ellipse cx="0" cy="2" rx="46" ry="8" fill="#00000018" />
                {selectedUid === it.uid && (
                  <ellipse cx="0" cy="-52" rx="72" ry="86" fill="none" stroke="#FF8FBF" strokeWidth="4" strokeDasharray="10 8" />
                )}
                <ItemArt kind={it.kind} />
                <rect x="-60" y="-150" width="120" height="155" fill="transparent" /></g>
              </g>
            );
          })}

          {/* Trash cloud — ALWAYS visible and clearly labelled. Drop a
              dragged item here (its centre inside the zone) to delete it,
              or tap an item and use the Buang button below the room. */}
          <g transform="translate(716 478)">
            <rect x={TRASH.x1 - 716} y={TRASH.y1 - 478} width={TRASH.x2 - TRASH.x1} height={TRASH.y2 - TRASH.y1} fill={dragUid !== null ? "#FF8FBF" : "transparent"} opacity="0.10" rx="18" />
            <circle r="40" fill="#FFE3F0" stroke="#FF8FBF" strokeWidth="3" strokeDasharray="7 6" />
            <path d="M-15,-14 h30 M-10,-14 v18 a6,6 0 0,0 6,6 h8 a6,6 0 0,0 6,-6 v-18 M-5,-21 h10 v5 h-10 Z M-5,-6 v12 M5,-6 v12" fill="none" stroke="#E7548F" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <text y="62" textAnchor="middle" fontSize="19" fontWeight="800" fill="#E7548F">🗑 Buang</text>
          </g>
          {poof && (
            <g key={poof.k} transform={`translate(${poof.x} ${poof.y})`} className="pop-place" pointerEvents="none">
              <circle r="26" fill="#FFE3F0" opacity="0.85" />
              <circle cx="-24" cy="-10" r="10" fill="#FFE3F0" opacity="0.7" />
              <circle cx="24" cy="-8" r="12" fill="#FFE3F0" opacity="0.7" />
              <path d="M0,-24 l3.4,7.6 7.6,3.4 -7.6,3.4 -3.4,7.6 -3.4,-7.6 -7.6,-3.4 7.6,-3.4Z" fill="#FFD66E" />
            </g>
          )}
          {armed && (
            <text x="400" y="36" textAnchor="middle" fontSize="21" fontWeight="800" fill="#2F7FC4">
              Ketuk tempat untuk menaruh {ITEMS.find((d) => d.kind === armed)?.name}
            </text>
          )}
        </svg>
      </div>

      {selectedUid !== null && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-base font-extrabold text-sky-800">
            {ITEMS.find((d) => d.kind === items.find((i) => i.uid === selectedUid)?.kind)?.name} dipilih
          </span>
          <button type="button" className="btn-candy min-h-12 px-6" style={{ background: "#FF8FBF" }}
            onClick={() => deleteItem(selectedUid)}>
            🗑 Buang
          </button>
          <button type="button" className="btn-candy btn-candy-white min-h-12 px-5" onClick={() => setSelectedUid(null)}>
            Selesai
          </button>
        </div>
      )}

      {hint && <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>}

      <div className="card-cloud p-4">
        <p className="text-base font-extrabold text-sky-800">Warna Dinding <span className="font-bold text-pink-500">(1 token)</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WALLS.map((wd, i) => (
            <button key={wd.name} type="button" onClick={() => applyWall(i)}
              className={`min-h-12 flex-1 rounded-full border-[3px] px-3 text-base font-extrabold text-sky-950 shadow transition active:scale-95 ${i === wall ? "border-sky-400 ring-4 ring-sky-200" : "border-white"}`}
              style={{ background: `linear-gradient(135deg, ${wd.a}, ${wd.b})` }}>
              {wd.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card-cloud p-4">
        <p className="text-base font-extrabold text-sky-800">Pilih Barang <span className="font-bold text-pink-500">(1 token per barang)</span></p>
        <div className="tray-scroll no-scrollbar">
          {ITEMS.map((d) => (
            <button key={d.kind} type="button" onClick={() => tapTray(d.kind)}
              className={`flex w-24 flex-col items-center gap-1 rounded-3xl border-[3px] bg-sky-50 p-2 pt-1 shadow-sm transition active:scale-95 ${armed === d.kind ? "border-pink-400 ring-4 ring-pink-200" : "border-white"}`}>
              <svg viewBox="-95 -150 190 160" className="h-16 w-20" aria-hidden="true"><g transform="scale(0.82)"><ItemArt kind={d.kind} /></g></svg>
              <span className="text-center text-[13px] font-extrabold leading-tight text-sky-900">{d.name}</span>
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-sky-900/60">Seret barang untuk memindah - seret ke awan sampah untuk membuang</p>
      </div>

      <button type="button" onClick={finish} className="btn-candy w-full">Selesai — Lihat Kamar Cantikku</button>

      {done && (
        <div className="card-cloud p-5 text-center">
          <p className="text-2xl font-extrabold text-sky-700">Masya Allah, kamarnya cantik sekali!</p>
          <p className="mt-1 text-base font-semibold text-sky-900/70">Kamar ini tersimpan otomatis. Besok bisa dihias lagi!</p>
          <button type="button" onClick={() => setDone(false)} className="btn-candy btn-candy-white mt-3">Hias Lagi</button>
        </div>
      )}

      <EarnSheet open={earnOpen} rewardLabel="+1 Token" onEarn={() => setTokens((t) => t + 1)} onClose={() => setEarnOpen(false)} />
    </div>
  );
}
