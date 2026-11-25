"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";

const KEY = "belajarngaji:v2:kue";
const FROST = ["#FF8FBF", "#7EC8F7", "#FFD66E", "#B18CFF", "#3FBFB2", "#FFF6EC", "#FF6B6B", "#8CE8C3"];
const TOPS = [
  { id: "stroberi", name: "Stroberi" },
  { id: "ceri", name: "Ceri" },
  { id: "krim", name: "Krim Putar" },
  { id: "lilin", name: "Lilin" },
  { id: "bunga", name: "Bunga Gula" },
  { id: "cokelat", name: "Bola Cokelat" },
] as const;
type TopId = (typeof TOPS)[number]["id"];
interface Top { id: number; type: TopId; x: number; y: number }
type Arm = { kind: "frost"; color: string } | { kind: "top"; type: TopId } | { kind: "drizzle" } | null;

// layer geometry (svg coords): index 0 = bottom
const LAYERS = [
  { x: 80, y: 322, w: 240, h: 66 },
  { x: 105, y: 262, w: 190, h: 62 },
  { x: 130, y: 206, w: 140, h: 58 },
];

function ToppingArt({ type }: { type: TopId }) {
  switch (type) {
    case "stroberi":
      return (<g><path d="M0,10 C-11,2 -12,-10 -4,-13 C0,-14 0,-14 4,-13 C12,-10 11,2 0,10Z" fill="#FF4757" stroke="#D63050" strokeWidth="1.6" /><path d="M-6,-12 Q0,-18 6,-12 Q0,-9 -6,-12Z" fill="#2FBF71" /><circle cx="-4" cy="-4" r="1.2" fill="#FFE3EA" /><circle cx="4" cy="0" r="1.2" fill="#FFE3EA" /><circle cx="0" cy="4" r="1.2" fill="#FFE3EA" /></g>);
    case "ceri":
      return (<g><path d="M2,-4 Q6,-14 13,-16" fill="none" stroke="#2FBF71" strokeWidth="2.4" /><circle cx="0" cy="4" r="9" fill="#E8324A" /><circle cx="-3" cy="1" r="3" fill="#FF8FA3" /></g>);
    case "krim":
      return (<g><path d="M-11,8 Q-13,-2 -5,-4 Q-8,-12 0,-13 Q8,-12 5,-4 Q13,-2 11,8 Q0,12 -11,8Z" fill="#FFFFFF" stroke="#E8DFF2" strokeWidth="1.6" /><circle cx="0" cy="-14" r="3" fill="#FF8FBF" /></g>);
    case "lilin":
      return (<g><rect x="-4" y="-6" width="8" height="18" rx="3" fill="#7EC8F7" /><path d="M-4,-1 h8 M-4,4 h8" stroke="#fff" strokeWidth="2" /><path d="M0,-18 C4,-12 4,-8 0,-6 C-4,-8 -4,-12 0,-18Z" fill="#FFB84D" /><circle cx="0" cy="-10" r="2" fill="#FFD66E" /></g>);
    case "bunga":
      return (<g>{[0, 72, 144, 216, 288].map((a) => (<ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 7} cy={Math.sin((a * Math.PI) / 180) * 7} rx="5.4" ry="4" fill="#FFB7D5" transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`} />))}<circle r="4" fill="#FFD66E" /></g>);
    case "cokelat":
      return (<g><circle r="9" fill="#8A5A33" /><path d="M-6,-3 a9 9 0 0 1 8,-6" fill="none" stroke="#C89B6A" strokeWidth="2.4" strokeLinecap="round" /><circle cx="3" cy="3" r="1.4" fill="#5E3A1E" /><circle cx="-3" cy="5" r="1.4" fill="#5E3A1E" /></g>);
  }
}

export function CakeGame() {
  const [tokens, setTokens] = useState(0);
  const [layers, setLayers] = useState<string[]>(["#FFF6EC", "#FFD3E8", "#BFE6FF"]);
  const [drizzle, setDrizzle] = useState<boolean[]>([false, false, false]);
  const [tops, setTops] = useState<Top[]>([]);
  const [tab, setTab] = useState<"frost" | "top" | "drizzle">("frost");
  const [arm, setArm] = useState<Arm>({ kind: "frost", color: FROST[0] });
  const [earnOpen, setEarnOpen] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [hint, setHint] = useState("Pilih krim di bawah, lalu ketuk lapisan kue untuk mewarnainya!");
  const svgRef = useRef<SVGSVGElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.layers)) setLayers(s.layers);
        if (Array.isArray(s.drizzle)) setDrizzle(s.drizzle);
        if (Array.isArray(s.tops)) { setTops(s.tops); idRef.current = (s.tops.at(-1)?.id ?? 0) + 1; }
        if (typeof s.tokens === "number") setTokens(s.tokens);
      }
    } catch { /* fresh cake */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ layers, drizzle, tops, tokens })); } catch { /* ignore */ }
  }, [layers, drizzle, tops, tokens]);

  const spend = (n: number): boolean => {
    if (tokens < n) { setEarnOpen(true); setHint("Tokennya habis — jawab soal dulu yuk untuk dapat token!"); return false; }
    setTokens((v) => v - n); return true;
  };

  const tapLayer = (i: number) => {
    if (!arm) return;
    if (arm.kind === "frost") {
      if (!spend(1)) return;
      setLayers((ls) => ls.map((c, j) => (j === i ? arm.color : c)));
      setHint("Cantik! Lapisan kuenya berubah warna.");
    } else if (arm.kind === "drizzle") {
      if (drizzle[i]) { setHint("Lapisan itu sudah ada siraman cokelatnya."); return; }
      if (!spend(1)) return;
      setDrizzle((d) => d.map((v, j) => (j === i ? true : v)));
      setHint("Nyam! Siraman cokelat ditambahkan.");
    }
  };

  const tapCake = (e: React.PointerEvent) => {
    if (!arm || arm.kind !== "top" || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 400;
    const y = ((e.clientY - r.top) / r.height) * 460;
    const li = LAYERS.findIndex((L) => y >= L.y - 16 && y <= L.y + 14 && x >= L.x && x <= L.x + L.w);
    if (li < 0) { setHint("Ketuk tepat di atas lapisan kue untuk menaruh topping."); return; }
    if (!spend(1)) return;
    const L = LAYERS[li];
    setTops((ts) => [...ts, { id: idRef.current++, type: (arm as { type: TopId }).type, x: Math.max(L.x + 14, Math.min(L.x + L.w - 14, x)), y: L.y - 4 }]);
    setHint("Topping terpasang! Kuenya makin cantik.");
  };

  const takePhoto = () => {
    confetti({ particleCount: 180, spread: 115, origin: { y: 0.45 }, colors: ["#FF8FBF", "#7EC8F7", "#FFD66E", "#ffffff"] });
    setPhoto(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Dekorasi Kue Cantik</h1>
          <p className="text-base font-semibold text-sky-900/70">Jawab soal dulu untuk dapat token, lalu hias kue lapis impianmu!</p>
        </div>
      </section>

      <TokenBar balance={tokens} unit="Token" earnLabel="Jawab untuk dapat Token" onEarnClick={() => setEarnOpen(true)} />

      <div className={`card-cloud overflow-hidden p-2 ${photo ? "ring-8 ring-white" : ""}`}>
        <div className="mx-auto w-full max-w-[430px]">
          <svg ref={svgRef} viewBox="0 0 400 460" className="block h-auto w-full select-none" role="application" aria-label="Kue lapis untuk dihias" onPointerUp={tapCake}>
            <defs>
              <linearGradient id="patBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF3E2" /><stop offset="55%" stopColor="#EFF9FF" /><stop offset="100%" stopColor="#FFE9F4" /></linearGradient>
            </defs>
            <rect width="400" height="460" fill="url(#patBg)" />
            {/* awning */}
            {Array.from({ length: 8 }).map((_, i) => (<path key={i} d={`M${i * 50},0 h50 v26 a25 14 0 0 1 -50 0 Z`} fill={i % 2 ? "#FFB7D5" : "#FFFFFF"} stroke="#F3C6DA" strokeWidth="1.4" />))}
            <circle cx="52" cy="86" r="17" fill="#FFD66E" opacity="0.85" />
            <path d="M316,74 l2.6,6 6,2.6 -6,2.6 -2.6,6 -2.6,-6 -6,-2.6 6,-2.6Z" fill="#FFB7D5" className="sparkle" />
            {/* stand */}
            <ellipse cx="200" cy="404" rx="148" ry="17" fill="#BFE6FF" stroke="#7EC8F7" strokeWidth="3" />
            <path d="M186,388 h28 l6,14 h-40 Z" fill="#7EC8F7" />
            <rect x="120" y="384" width="160" height="8" rx="4" fill="#D6F0FF" />
            {/* layers */}
            {LAYERS.map((L, i) => (
              <g key={i} onClick={() => tapLayer(i)} className="cursor-pointer">
                <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="13" fill={layers[i]} stroke="rgba(120,80,40,0.18)" strokeWidth="2" />
                <path d={`M${L.x},${L.y + 13} q10,13 20,0 q10,13 20,0 q10,13 20,0 q10,13 20,0 q10,13 20,0 ${L.w > 190 ? "q10,13 20,0 q10,13 20,0 q10,13 20,0 q10,13 20,0" : L.w > 150 ? "q10,13 20,0 q10,13 20,0 q10,13 20,0" : "q10,13 20,0 q10,13 20,0"} L${L.x + L.w},${L.y} L${L.x},${L.y} Z`} fill="rgba(255,255,255,0.55)" />
                {drizzle[i] && (<path d={`M${L.x + 3},${L.y + 4} h${L.w - 6} v7 q-9,15 -18,1 q-9,14 -18,0 q-9,15 -18,1 q-9,14 -18,0 q-9,15 -18,1 q-9,14 -18,0 ${L.w > 190 ? "q-9,15 -18,1 q-9,14 -18,0 q-9,15 -18,1 q-9,14 -18,0" : ""} v-8 Z`} fill="#8A5A33" opacity="0.92" />)}
                <rect x={L.x} y={L.y + L.h - 12} width={L.w} height="7" rx="3.5" fill="rgba(255,255,255,0.4)" />
              </g>
            ))}
            {tops.map((t) => (<g key={t.id} transform={`translate(${t.x} ${t.y})`} className="pop-place"><ToppingArt type={t.type} /></g>))}
          </svg>
        </div>
        {photo && <p className="pb-3 text-center text-xl font-extrabold text-pink-500">Masya Allah, kuenya cantik sekali!</p>}
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>

      <div className="card-cloud p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {([["frost", "Warna Krim"], ["top", "Topping"], ["drizzle", "Siram Cokelat"]] as const).map(([id, name]) => (
            <button key={id} type="button" onClick={() => { setTab(id); setArm(id === "frost" ? { kind: "frost", color: FROST[0] } : id === "drizzle" ? { kind: "drizzle" } : { kind: "top", type: "stroberi" }); }}
              className={`min-h-12 rounded-full border-[3px] px-5 text-base font-extrabold shadow transition active:scale-95 ${tab === id ? "border-pink-400 bg-pink-100 text-pink-700" : "border-white bg-sky-100 text-sky-800"}`}>{name}</button>
          ))}
        </div>
        {tab === "frost" && (
          <div className="tray-scroll">
            {FROST.map((c) => (
              <button key={c} type="button" aria-label={`Krim ${c}`} onClick={() => setArm({ kind: "frost", color: c })}
                className={`h-14 w-14 shrink-0 rounded-full border-4 shadow transition active:scale-90 ${arm?.kind === "frost" && arm.color === c ? "border-pink-400 scale-110" : "border-white"}`} style={{ background: `linear-gradient(160deg, #ffffff88, transparent), ${c}` }} />
            ))}
          </div>
        )}
        {tab === "top" && (
          <div className="tray-scroll">
            {TOPS.map((t) => (
              <button key={t.id} type="button" onClick={() => setArm({ kind: "top", type: t.id })}
                className={`flex min-h-14 shrink-0 flex-col items-center gap-1 rounded-3xl border-[3px] px-4 py-2 shadow transition active:scale-95 ${arm?.kind === "top" && arm.type === t.id ? "border-pink-400 bg-pink-50" : "border-white bg-sky-50"}`}>
                <svg viewBox="-18 -20 36 36" className="h-9 w-9"><ToppingArt type={t.id} /></svg>
                <span className="text-xs font-extrabold text-sky-800">{t.name}</span>
              </button>
            ))}
          </div>
        )}
        {tab === "drizzle" && <p className="text-base font-semibold text-sky-900/70">Ketuk lapisan kue untuk menyiram cokelat leleh di atasnya (1 token per lapisan).</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-candy btn-candy-pink min-h-12 px-6" onClick={takePhoto}>Foto Kueku</button>
          <button type="button" className="btn-candy btn-candy-white min-h-12 px-6" onClick={() => { setTops([]); setDrizzle([false, false, false]); setPhoto(false); setHint("Kue baru! Yuk hias lagi dari awal."); }}>Kue Baru</button>
        </div>
      </div>

      <EarnSheet open={earnOpen} rewardLabel="+1 Token Bintang" onEarn={() => { setTokens((v) => v + 1); setHint("Token didapat! Yuk hias kuenya."); }} onClose={() => setEarnOpen(false)} />
    </div>
  );
}
