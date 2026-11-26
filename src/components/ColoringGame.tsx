"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CloudPuppy } from "@/components/CloudPuppy";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";

/* Mewarnai Masjid — a coloring-book clone (cf. "Buku Mewarnai Mandala" on
   games.co.id): pick a crayon, tap a big region of the picture, it fills.
   The base palette is FREE (coloring is never blocked); only the three
   special finishes (gold / rainbow / sparkle) cost 1 token via EarnSheet. */

const KEY = "belajarngaji:v2:mewarnai";

const PALETTE = [
  { hex: "#FF6B6B", name: "Merah" },
  { hex: "#FFA94D", name: "Oranye" },
  { hex: "#FFD43B", name: "Kuning" },
  { hex: "#69DB7C", name: "Hijau" },
  { hex: "#38D9A9", name: "Toska" },
  { hex: "#4DABF7", name: "Biru Langit" },
  { hex: "#748FFC", name: "Biru" },
  { hex: "#B197FC", name: "Ungu" },
  { hex: "#FAA2C1", name: "Merah Muda" },
  { hex: "#C08552", name: "Cokelat" },
];

const SPECIALS = [
  { id: "gold", name: "Emas", swatch: "linear-gradient(135deg,#FFE97A,#F5B921)" },
  { id: "rainbow", name: "Pelangi", swatch: "linear-gradient(135deg,#FF6B6B,#FFD43B,#69DB7C,#4DABF7,#B197FC)" },
  { id: "sparkle", name: "Kilau", swatch: "radial-gradient(circle at 35% 35%, #FFE3F0, #FFB7D5)" },
] as const;

type SpecialId = (typeof SPECIALS)[number]["id"];

const REGIONS = [
  "sky", "sun", "cloud1", "cloud2", "crescent", "dome",
  "minaretL", "minaretR", "body", "door", "windowL", "windowR",
  "grass", "tree", "flower1", "flower2",
] as const;
type Region = (typeof REGIONS)[number];

/* sparkle position per region (in viewBox coords) */
const SPOT: Record<Region, [number, number]> = {
  sky: [36, 150], sun: [56, 54], cloud1: [292, 52], cloud2: [128, 38],
  crescent: [200, 66], dome: [200, 138], minaretL: [110, 205], minaretR: [290, 205],
  body: [200, 190], door: [200, 252], windowL: [164, 218], windowR: [236, 218],
  grass: [64, 292], tree: [34, 200], flower1: [322, 294], flower2: [284, 302],
};

const OUTLINE = "#4A90C4";

function blankFills(): Record<Region, string> {
  return Object.fromEntries(REGIONS.map((r) => [r, "#FFFFFF"])) as Record<Region, string>;
}

function fillValue(v: string): string {
  if (v === "gold") return "url(#cwGold)";
  if (v === "rainbow") return "url(#cwRainbow)";
  if (v === "sparkle") return "url(#cwSparkle)";
  return v;
}

export function ColoringGame() {
  const [fills, setFills] = useState<Record<Region, string>>(blankFills);
  const [selected, setSelected] = useState<string>(PALETTE[5].hex);
  const [armed, setArmed] = useState<SpecialId | null>(null);
  const [tokens, setTokens] = useState(0);
  const [earnOpen, setEarnOpen] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [spark, setSpark] = useState<{ r: Region; k: number } | null>(null);
  const [hint, setHint] = useState("Pilih warna krayon, lalu ketuk bagian gambar untuk mewarnainya!");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFills({ ...blankFills(), ...(JSON.parse(raw) as Record<Region, string>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(fills));
    } catch {
      /* ignore */
    }
  }, [fills]);

  const tapRegion = (r: Region) => {
    const value = armed ?? selected;
    setFills((prev) => ({ ...prev, [r]: value }));
    setSpark({ r, k: Date.now() });
    window.setTimeout(() => setSpark(null), 600);
    if (armed) {
      setHint("Waaah, warna istimewanya cantik sekali!");
      setArmed(null);
    }
    setPhoto(false);
  };

  const pickSpecial = (id: SpecialId) => {
    if (armed === id) {
      setArmed(null);
      return;
    }
    if (tokens < 1) {
      setEarnOpen(true);
      setHint("Warna istimewa butuh 1 token — jawab soal dulu yuk!");
      return;
    }
    setTokens((v) => v - 1);
    setArmed(id);
    setHint("Warna istimewa siap! Ketuk bagian gambar untuk memakainya.");
  };

  const randomAll = () => {
    const next = blankFills();
    for (const r of REGIONS) next[r] = PALETTE[Math.floor(Math.random() * PALETTE.length)].hex;
    setFills(next);
    setPhoto(false);
    setHint("Taraaa! Semua warna diacak. Cantik ya!");
  };

  const resetAll = () => {
    setFills(blankFills());
    setArmed(null);
    setPhoto(false);
    setHint("Gambar kosong lagi. Yuk warnai dari awal!");
  };

  const takePhoto = () => {
    setPhoto(true);
    confetti({
      particleCount: 180,
      spread: 115,
      origin: { y: 0.45 },
      colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#69DB7C", "#ffffff"],
    });
  };

  const regionProps = (r: Region) => ({
    fill: fillValue(fills[r]),
    stroke: OUTLINE,
    strokeWidth: 3,
    strokeLinejoin: "round" as const,
    onClick: () => tapRegion(r),
    className: "cursor-pointer",
  });

  return (
    <div className="flex flex-col gap-4">
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0">
          <CloudPuppy size={64} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Mewarnai Masjid</h1>
          <p className="text-base font-semibold text-sky-900/70">
            Pilih warna, lalu ketuk gambarnya. Semudah itu!
          </p>
        </div>
      </section>

      <TokenBar balance={tokens} unit="Token" earnLabel="Jawab untuk dapat Token" onEarnClick={() => setEarnOpen(true)} />

      {/* PICTURE */}
      <div className={`card-cloud mx-auto w-full max-w-[430px] p-2 ${photo ? "ring-8 ring-white" : ""}`}>
        <svg viewBox="0 0 400 320" className="block h-auto w-full select-none" role="application" aria-label="Gambar masjid untuk diwarnai">
          <defs>
            <linearGradient id="cwGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE97A" />
              <stop offset="55%" stopColor="#F5B921" />
              <stop offset="100%" stopColor="#FFD66E" />
            </linearGradient>
            <linearGradient id="cwRainbow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="25%" stopColor="#FFA94D" />
              <stop offset="45%" stopColor="#FFD43B" />
              <stop offset="65%" stopColor="#69DB7C" />
              <stop offset="85%" stopColor="#4DABF7" />
              <stop offset="100%" stopColor="#B197FC" />
            </linearGradient>
            <pattern id="cwSparkle" width="26" height="26" patternUnits="userSpaceOnUse">
              <rect width="26" height="26" fill="#FFF0F6" />
              <path d="M8,4 l1.4,3.4 3.4,1.4 -3.4,1.4 -1.4,3.4 -1.4,-3.4 -3.4,-1.4 3.4,-1.4Z" fill="#FF8FBF" />
              <circle cx="20" cy="19" r="2.2" fill="#FFD66E" />
            </pattern>
          </defs>

          {/* sky */}
          <rect x="0" y="0" width="400" height="320" {...regionProps("sky")} stroke="none" />

          {/* sun */}
          <g onClick={() => tapRegion("sun")} className="cursor-pointer">
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={56 + Math.cos(a) * 33}
                  y1={54 + Math.sin(a) * 33}
                  x2={56 + Math.cos(a) * 42}
                  y2={54 + Math.sin(a) * 42}
                  stroke={OUTLINE}
                  strokeWidth={3.4}
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx={56} cy={54} r={27} fill={fillValue(fills.sun)} stroke={OUTLINE} strokeWidth={3} />
            <circle cx={48} cy={50} r={2.6} fill={OUTLINE} />
            <circle cx={64} cy={50} r={2.6} fill={OUTLINE} />
            <path d="M48,62 q8,6 16,0" fill="none" stroke={OUTLINE} strokeWidth={2.6} strokeLinecap="round" />
          </g>

          {/* clouds */}
          <g transform="translate(268 30) scale(1.1)" onClick={() => tapRegion("cloud1")} className="cursor-pointer">
            <path d="M14 36 a8 8 0 1 1 2-15.8 A10 10 0 0 1 35 18 a7.5 7.5 0 1 1 1 18 Z" fill={fillValue(fills.cloud1)} stroke={OUTLINE} strokeWidth={2.6} />
          </g>
          <g transform="translate(104 16) scale(0.8)" onClick={() => tapRegion("cloud2")} className="cursor-pointer">
            <path d="M14 36 a8 8 0 1 1 2-15.8 A10 10 0 0 1 35 18 a7.5 7.5 0 1 1 1 18 Z" fill={fillValue(fills.cloud2)} stroke={OUTLINE} strokeWidth={3} />
          </g>

          {/* grass */}
          <path d="M0,268 Q100,252 200,268 T400,268 V320 H0Z" {...regionProps("grass")} />

          {/* tree */}
          <g onClick={() => tapRegion("tree")} className="cursor-pointer">
            <rect x={29} y={222} width={10} height={44} rx={4} fill={fillValue(fills.tree)} stroke={OUTLINE} strokeWidth={3} />
            <circle cx={34} cy={196} r={24} fill={fillValue(fills.tree)} stroke={OUTLINE} strokeWidth={3} />
            <circle cx={16} cy={212} r={15} fill={fillValue(fills.tree)} stroke={OUTLINE} strokeWidth={3} />
            <circle cx={52} cy={212} r={15} fill={fillValue(fills.tree)} stroke={OUTLINE} strokeWidth={3} />
          </g>

          {/* minarets */}
          {(
            [
              ["minaretL", 100],
              ["minaretR", 280],
            ] as [Region, number][]
          ).map(([id, x]) => (
            <g key={id} onClick={() => tapRegion(id)} className="cursor-pointer">
              <path d={`M${x + 2},128 L${x + 10},102 L${x + 18},128Z`} fill={fillValue(fills[id])} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
              <rect x={x} y={128} width={20} height={142} rx={6} fill={fillValue(fills[id])} stroke={OUTLINE} strokeWidth={3} />
              <rect x={x - 5} y={164} width={30} height={11} rx={5.5} fill={fillValue(fills[id])} stroke={OUTLINE} strokeWidth={3} />
              <path d={`M${x + 6},206 v-12 a4,4 0 0 1 8,0 v12Z`} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={2.4} />
            </g>
          ))}

          {/* dome + crescent */}
          <g onClick={() => tapRegion("crescent")} className="cursor-pointer">
            <rect x={198} y={80} width={4} height={16} fill={fillValue(fills.crescent)} stroke={OUTLINE} strokeWidth={2} />
            <path d="M208,52 a14,14 0 1 0 5,26 a11,11 0 1 1 -5,-26Z" fill={fillValue(fills.crescent)} stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          </g>
          <path d="M200,98 C170,98 160,132 158,176 L242,176 C240,132 230,98 200,98Z" {...regionProps("dome")} />

          {/* body */}
          <rect x={138} y={176} width={124} height={94} rx={10} {...regionProps("body")} />

          {/* windows */}
          <path d="M156,234 v-15 a8,9 0 0 1 16,0 v15Z" {...regionProps("windowL")} />
          <path d="M228,234 v-15 a8,9 0 0 1 16,0 v15Z" {...regionProps("windowR")} />

          {/* door */}
          <path d="M185,270 v-31 a15,13 0 0 1 30,0 v31Z" {...regionProps("door")} />

          {/* flowers */}
          {(
            [
              ["flower1", 322, 294],
              ["flower2", 284, 303],
            ] as [Region, number, number][]
          ).map(([id, x, y]) => (
            <g key={id} transform={`translate(${x} ${y})`} onClick={() => tapRegion(id)} className="cursor-pointer">
              <line x1={0} y1={4} x2={0} y2={14} stroke={OUTLINE} strokeWidth={2.6} strokeLinecap="round" />
              {[0, 72, 144, 216, 288].map((a) => (
                <circle
                  key={a}
                  cx={Math.cos((a * Math.PI) / 180) * 6}
                  cy={Math.sin((a * Math.PI) / 180) * 6}
                  r={5}
                  fill={fillValue(fills[id])}
                  stroke={OUTLINE}
                  strokeWidth={2.2}
                />
              ))}
              <circle r={3.4} fill="#FFD66E" stroke={OUTLINE} strokeWidth={2} />
            </g>
          ))}

          {spark && (
            <g key={spark.k} transform={`translate(${SPOT[spark.r][0]} ${SPOT[spark.r][1]})`} className="pop-place" pointerEvents="none">
              <path d="M0,-16 l4,10 10,4 -10,4 -4,10 -4,-10 -10,-4 10,-4Z" fill="#FFD66E" stroke="#fff" strokeWidth={1.6} />
            </g>
          )}
        </svg>
        {photo && <p className="pb-3 text-center text-xl font-extrabold text-pink-500">Masya Allah, gambarnya cantik sekali!</p>}
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>

      {/* PALETTE */}
      <div className="card-cloud p-4">
        <p className="text-sm font-extrabold uppercase tracking-wide text-sky-500">Kotak Krayon</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => { setSelected(c.hex); setArmed(null); }}
              aria-label={`Warna ${c.name}`}
              className={`h-14 w-14 rounded-full shadow ring-4 transition active:scale-90 ${
                selected === c.hex && !armed ? "-translate-y-1.5 ring-sky-600" : "ring-white"
              }`}
              style={{ background: `radial-gradient(circle at 32% 30%, #ffffff66, transparent 45%), ${c.hex}` }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm font-extrabold uppercase tracking-wide text-sky-500">Warna Istimewa · 1 Token</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPECIALS.map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => pickSpecial(sp.id)}
              aria-label={`Warna istimewa ${sp.name}`}
              className={`min-h-14 rounded-full px-5 text-base font-extrabold text-sky-900 shadow ring-4 transition active:scale-95 ${
                armed === sp.id ? "-translate-y-1 ring-amber-400" : "ring-white"
              }`}
              style={{ background: sp.swatch }}
            >
              {sp.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-candy min-h-12 px-5" onClick={randomAll}>Acak Warna</button>
        <button type="button" className="btn-candy btn-candy-white min-h-12 px-5" onClick={resetAll}>Mulai Ulang</button>
        <button type="button" className="btn-candy btn-candy-pink min-h-12 px-5" onClick={takePhoto}>Foto</button>
      </div>

      <EarnSheet
        open={earnOpen}
        rewardLabel="+1 Token Bintang"
        onEarn={() => { setTokens((v) => v + 1); setHint("Token didapat! Pilih warna istimewanya ya."); }}
        onClose={() => setEarnOpen(false)}
      />
    </div>
  );
}
