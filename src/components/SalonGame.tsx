"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { EarnSheet, TokenBar } from "@/components/EarnSheet";
import { CloudPuppy } from "@/components/CloudPuppy";
import { GameGuide } from "@/components/GameGuide";
import { SurahGate } from "@/components/SurahGate";

/* Salon Hijab Cantik v2 — beauty studio, one large layered SVG girl,
   tool-based makeup: pick tool -> pick colour -> TAP the body part.
   Answer-first: every application costs 1 token. */

type Tool = "blush" | "lip" | "shadow" | "hijab" | "dress" | "acc";
type Pattern = "plain" | "polka" | "stripe";

interface ColorDef { name: string; main: string; dark: string; light: string }
interface Look {
  blush: string | null;
  lip: string;
  shadow: string | null;
  hijab: number;
  hijabPattern: Pattern;
  dress: number;
  acc: string;
}

const HIJABS: ColorDef[] = [
  { name: "Langit", main: "#7EC8F7", dark: "#4A9BD8", light: "#CDEFFF" },
  { name: "Permen", main: "#FFB7D5", dark: "#F08BB8", light: "#FFE3F0" },
  { name: "Lilac", main: "#B79CFF", dark: "#8F74E8", light: "#E7DEFF" },
  { name: "Mint", main: "#7ED8B2", dark: "#4BB98C", light: "#D8F7E8" },
  { name: "Krim", main: "#FFD98A", dark: "#EFB84E", light: "#FFF0C2" },
  { name: "Putih Awan", main: "#FFFFFF", dark: "#D6E9F7", light: "#FFFFFF" },
];
const DRESSES: ColorDef[] = [
  { name: "Mawar", main: "#FF8FBF", dark: "#E7548F", light: "#FFD3E8" },
  { name: "Samudra", main: "#5EB2F2", dark: "#2F7FC4", light: "#BFE6FF" },
  { name: "Lavender", main: "#9B7EDE", dark: "#7758C4", light: "#DCCFFF" },
  { name: "Mentari", main: "#FFC46E", dark: "#F09A2E", light: "#FFE7BC" },
  { name: "Daun", main: "#5ED0A0", dark: "#34A878", light: "#C4F2DE" },
];
const BLUSH = ["#FFB7D5", "#FF9E9E", "#FFC4A3", "#F78FB0"];
const LIPS = ["#FF7D9C", "#E7548F", "#FF9E7D", "#D14E7E"];
const SHADOWS = ["#B79CFF", "#7EC8F7", "#FFB7D5", "#FFD66E"];
const ACCS: { id: string; name: string }[] = [
  { id: "none", name: "Tanpa" },
  { id: "bow", name: "Pita" },
  { id: "flower", name: "Bunga" },
  { id: "crown", name: "Mahkota" },
  { id: "glasses", name: "Kacamata" },
  { id: "starpin", name: "Pin Bintang" },
  { id: "bag", name: "Tas Kecil" },
];
const TOOLS: { id: Tool; name: string }[] = [
  { id: "blush", name: "Blush" },
  { id: "lip", name: "Lipstik" },
  { id: "shadow", name: "Eyeshadow" },
  { id: "hijab", name: "Hijab" },
  { id: "dress", name: "Baju" },
  { id: "acc", name: "Aksesori" },
];
const ZONE_FOR: Record<Tool, string> = {
  blush: "pipinya", lip: "bibirnya", shadow: "kelopak matanya",
  hijab: "hijabnya", dress: "bajunya", acc: "kepalanya",
};

const DEFAULT_LOOK: Look = { blush: "#FFB7D5", lip: "#FF7D9C", shadow: null, hijab: 0, hijabPattern: "plain", dress: 0, acc: "bow" };
const SAVE_KEY = "belajarngaji:v2:salon";

function Accessory({ id }: { id: string }) {
  switch (id) {
    case "bow":
      return (<g transform="translate(272 84)">
        <path d="M0,0 L-30,-16 Q-40,0 -30,16 Z" fill="#FF8FBF" stroke="#E7548F" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0,0 L30,-16 Q40,0 30,16 Z" fill="#FF8FBF" stroke="#E7548F" strokeWidth="3" strokeLinejoin="round" />
        <circle r="9" fill="#E7548F" /><circle r="3.5" fill="#FFD3E8" />
      </g>);
    case "flower":
      return (<g transform="translate(128 88)">
        {[0, 72, 144, 216, 288].map((a) => (<ellipse key={a} cx="0" cy="-13" rx="8" ry="13" fill="#FFB7D5" stroke="#F08BB8" strokeWidth="2" transform={`rotate(${a})`} />))}
        <circle r="7" fill="#FFD66E" stroke="#F5B81E" strokeWidth="2" />
      </g>);
    case "crown":
      return (<g transform="translate(200 40)">
        <path d="M-34,16 L-38,-14 L-18,2 L0,-20 L18,2 L38,-14 L34,16 Z" fill="#FFD66E" stroke="#E9B949" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="0" cy="2" r="5" fill="#FF8FBF" /><circle cx="-20" cy="8" r="3.6" fill="#7EC8F7" /><circle cx="20" cy="8" r="3.6" fill="#7EC8F7" />
      </g>);
    case "glasses":
      return (<g>
        <circle cx="162" cy="192" r="27" fill="#BFE6FF" opacity="0.35" stroke="#E7548F" strokeWidth="4.5" />
        <circle cx="238" cy="192" r="27" fill="#BFE6FF" opacity="0.35" stroke="#E7548F" strokeWidth="4.5" />
        <path d="M189,192 h22 M135,186 q-14,-4 -22,2 M265,186 q14,-4 22,2" stroke="#E7548F" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M150,178 l14,10 M226,178 l14,10" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </g>);
    case "starpin":
      return (<g transform="translate(200 336)">
        <path d="M0,-14 l4.2,9.2 10,1.3 -7.3,7 1.8,9.9 L0,7.6 l-8.7,4.4 1.8,-9.9 -7.3,-7 10,-1.3 Z" fill="#FFD66E" stroke="#F5B81E" strokeWidth="2.4" strokeLinejoin="round" />
      </g>);
    case "bag":
      return (<g transform="translate(316 428)">
        <path d="M-16,-24 a16,14 0 0,1 32,0" fill="none" stroke="#B07B45" strokeWidth="5" />
        <rect x="-26" y="-24" width="52" height="42" rx="10" fill="#FFB7D5" stroke="#F08BB8" strokeWidth="3" />
        <path d="M-26,-8 h52" stroke="#F08BB8" strokeWidth="3" />
        <circle cx="0" cy="2" r="5" fill="#FFD66E" stroke="#E9B949" strokeWidth="2" />
      </g>);
    default:
      return null;
  }
}

export function SalonGame() {
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [tokens, setTokens] = useState(0);
  const [earnOpen, setEarnOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("blush");
  const [pending, setPending] = useState<string | number | null>(null);
  const [pattern, setPattern] = useState<Pattern>("plain");
  const [spark, setSpark] = useState<{ x: number; y: number; k: number } | null>(null);
  const [photo, setPhoto] = useState(false);
  const [hint, setHint] = useState("Pilih alat, pilih warna, lalu ketuk bagian tubuhnya!");
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { look: Look; tokens: number };
        if (s.look) setLook({ ...DEFAULT_LOOK, ...s.look });
        if (typeof s.tokens === "number") setTokens(s.tokens);
      }
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify({ look, tokens })); } catch { /* ignore */ }
  }, [look, tokens]);

  const hj = HIJABS[look.hijab] ?? HIJABS[0];
  const dr = DRESSES[look.dress] ?? DRESSES[0];

  const burst = (x: number, y: number) => {
    setSpark({ x, y, k: Date.now() });
    window.setTimeout(() => setSpark(null), 700);
  };

  const tapZone = (zone: Tool, x: number, y: number) => {
    if (pending === null) { setTool(zone); setHint(`Alat ${TOOLS.find((t) => t.id === zone)?.name} dipilih — sekarang pilih warnanya di bawah`); return; }
    if (zone !== tool) { setHint(`Hampir! Untuk alat ini, ketuk ${ZONE_FOR[tool]} ya`); return; }
    if (tokens < 1) { setEarnOpen(true); setHint("Token habis — jawab dulu untuk dapat token!"); return; }
    setTokens((t) => t - 1);
    setLook((l) => {
      const n = { ...l };
      if (tool === "blush") n.blush = pending === "none" ? null : (pending as string);
      if (tool === "lip") n.lip = pending as string;
      if (tool === "shadow") n.shadow = pending === "none" ? null : (pending as string);
      if (tool === "hijab") { n.hijab = pending as number; n.hijabPattern = pattern; }
      if (tool === "dress") n.dress = pending as number;
      if (tool === "acc") n.acc = pending as string;
      return n;
    });
    setPending(null);
    burst(x, y);
    setHint("Berhasil dipakai! Cantik sekali");
  };

  /* The head is one shared zone for two tools: it resolves to the ACTIVE
     tool — Hijab when the hijab tool is active, Aksesori when the
     accessory tool is active. With any other tool active it just explains
     (or, via tapZone, points her to the right body part). */
  const tapHead = (x: number, y: number) => {
    if (tool === "hijab" || tool === "acc") { tapZone(tool, x, y); return; }
    if (pending === null) { setHint("Bagian kepala untuk alat Hijab atau Aksesori — pilih salah satu alat itu dulu ya"); return; }
    // Another tool is armed: route through tapZone with a deliberately
    // different zone so she gets the "ketuk <bagian yang benar>" hint
    // instead of applying makeup to the wrong place.
    tapZone("hijab", x, y);
  };

  const randomize = () => {
    if (tokens < 2) { setEarnOpen(true); setHint("Acak Cantik butuh 2 token — jawab dua soal dulu yuk!"); return; }
    setTokens((t) => t - 2);
    setLook({
      blush: BLUSH[Math.floor(Math.random() * BLUSH.length)],
      lip: LIPS[Math.floor(Math.random() * LIPS.length)],
      shadow: SHADOWS[Math.floor(Math.random() * SHADOWS.length)],
      hijab: Math.floor(Math.random() * HIJABS.length),
      hijabPattern: (["plain", "polka", "stripe"] as Pattern[])[Math.floor(Math.random() * 3)],
      dress: Math.floor(Math.random() * DRESSES.length),
      acc: ACCS[1 + Math.floor(Math.random() * (ACCS.length - 1))].id,
    });
    burst(200, 200);
    setHint("Tadaaa! Gaya acak yang cantik!");
  };

  const takePhoto = () => {
    confetti({ particleCount: 170, spread: 110, origin: { y: 0.45 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
    setPhoto(true);
  };

  const zoneCls = "cursor-pointer";
  const pulse = pending !== null ? { stroke: "#FF8FBF", strokeWidth: 3, strokeDasharray: "8 6", fill: "#FF8FBF", opacity: 0.14 } : { fill: "transparent" };

  return (
    <div className="flex flex-col gap-4">
      <GameGuide gameId="salon" title="Salon Hijab Cantik" steps={[{ icon: "⭐", text: "Jawab soal untuk dapat token" }, { icon: "💄", text: "Pilih alat dan warna di bawah" }, { icon: "👆", text: "Ketuk wajah atau bajunya untuk memakai" }]} />
      <SurahGate gameId="salon" />
      <section className="card-cloud flex items-center gap-3 p-4">
        <span className="floaty shrink-0"><CloudPuppy size={64} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">Salon Hijab Cantik</h1>
          <p className="text-base font-semibold text-sky-900/70">Jawab soal dulu untuk dapat token, lalu dandani sahabatmu!</p>
        </div>
      </section>

      <TokenBar balance={tokens} unit="Token" earnLabel="Jawab untuk dapat Token" onEarnClick={() => setEarnOpen(true)} />

      {/* STUDIO */}
      <div className={`card-cloud overflow-hidden p-2 ${photo ? "ring-8 ring-white" : ""}`}>
        <div className="mx-auto w-full max-w-[420px]">
        <svg viewBox="0 0 400 540" className="block h-auto w-full select-none" role="application" aria-label="Studio salon dan sahabat untuk didandani">
          <defs>
            <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE9F4" /><stop offset="60%" stopColor="#EFF9FF" /><stop offset="100%" stopColor="#D6F0FF" />
            </linearGradient>
            <pattern id="hijabPolka" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="4" fill="#ffffff" opacity="0.5" /><circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.35" />
            </pattern>
            <pattern id="hijabStripe" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
              <rect width="9" height="22" fill="#ffffff" opacity="0.32" />
            </pattern>
            <clipPath id="hijabClip">
              <path d="M200,50 C114,50 90,128 94,212 C97,276 82,320 62,358 C112,386 288,386 338,358 C318,320 303,276 306,212 C310,128 286,50 200,50 Z" />
            </clipPath>
            <clipPath id="dressClip">
              <path d="M148,540 L166,368 Q200,344 234,368 L252,540 Z" />
            </clipPath>
          </defs>

          <rect x="0" y="0" width="400" height="540" fill="url(#studioBg)" />
          {/* vanity mirror with bulbs */}
          <path d="M200,26 C104,26 62,110 62,214 L62,392 L338,392 L338,214 C338,110 296,26 200,26 Z" fill="#FFFFFF" opacity="0.75" />
          <path d="M200,40 C116,40 78,116 78,214 L78,378 L322,378 L322,214 C322,116 284,40 200,40 Z" fill="#FFF7FB" stroke="#FFD3E8" strokeWidth="4" />
          {[70, 130, 190, 250, 310].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 200 + Math.cos(rad) * 128, y = 214 - Math.sin(rad) * 168;
            return (<g key={i}><circle cx={x} cy={Math.max(48, y)} r="10" fill="#FFD66E" opacity="0.3" /><circle cx={x} cy={Math.max(48, y)} r="5.5" fill="#FFDF8A" stroke="#E9B949" strokeWidth="1.6" /></g>);
          })}
          {/* side pots */}
          <g transform="translate(38 452)"><rect x="-16" y="-20" width="32" height="26" rx="6" fill="#FFB7D5" /><rect x="-16" y="-30" width="32" height="12" rx="6" fill="#FF8FBF" /><circle cx="0" cy="-40" r="8" fill="#FFD66E" /></g>
          <g transform="translate(362 452)"><rect x="-13" y="-34" width="26" height="40" rx="6" fill="#7EC8F7" /><rect x="-6" y="-44" width="12" height="12" rx="3" fill="#2F7FC4" /></g>
          <ellipse cx="200" cy="516" rx="150" ry="16" fill="#2F7FC4" opacity="0.10" />

          {/* DRESS (behind hijab drape) */}
          <g onClick={() => tapZone("dress", 200, 470)} className={zoneCls}>
            <path d="M148,540 L166,368 Q200,344 234,368 L252,540 Z" fill={dr.main} />
            <g clipPath="url(#dressClip)">
              <path d="M148,470 q52,-18 104,0 l0,22 q-52,-18 -104,0 Z" fill={dr.light} opacity="0.8" />
              <circle cx="176" cy="420" r="5" fill="#fff" opacity="0.5" /><circle cx="222" cy="446" r="5" fill="#fff" opacity="0.5" /><circle cx="196" cy="498" r="5" fill="#fff" opacity="0.5" />
            </g>
            <path d="M166,368 Q200,344 234,368 L228,392 Q200,372 172,392 Z" fill={dr.dark} />
            <circle cx="200" cy="404" r="6" fill="#FFD66E" stroke="#E9B949" strokeWidth="2" />
          </g>
          {/* arms / sleeves */}
          <path d="M166,378 C138,420 128,470 134,516 L160,516 C158,472 164,428 176,398 Z" fill={dr.dark} />
          <path d="M234,378 C262,420 272,470 266,516 L240,516 C242,472 236,428 224,398 Z" fill={dr.dark} />
          <circle cx="147" cy="522" r="10" fill="#FFDFC4" /><circle cx="253" cy="522" r="10" fill="#FFDFC4" />

          {/* HIJAB back drape */}
          <g>
            <path d="M200,50 C114,50 90,128 94,212 C97,276 82,320 62,358 C112,386 288,386 338,358 C318,320 303,276 306,212 C310,128 286,50 200,50 Z" fill={hj.main} />
            <g clipPath="url(#hijabClip)">
              {look.hijabPattern === "polka" && <rect x="50" y="40" width="300" height="360" fill="url(#hijabPolka)" />}
              {look.hijabPattern === "stripe" && <rect x="50" y="40" width="300" height="360" fill="url(#hijabStripe)" />}
              <path d="M96,120 C80,220 92,300 76,352 C96,364 118,370 132,372 C116,300 112,210 118,130 Z" fill={hj.dark} opacity="0.35" />
              <path d="M304,120 C320,220 308,300 324,352 C304,364 282,370 268,372 C284,300 288,210 282,130 Z" fill={hj.dark} opacity="0.35" />
              <ellipse cx="200" cy="66" rx="70" ry="20" fill={hj.light} opacity="0.8" />
            </g>
          </g>

          {/* FACE */}
          <ellipse cx="200" cy="196" rx="76" ry="90" fill="#FFDFC4" />
          <ellipse cx="200" cy="252" rx="46" ry="34" fill="#FFD3B0" opacity="0.55" />
          {/* forehead band */}
          <path d="M128,176 C130,112 162,82 200,82 C238,82 270,112 272,176 C248,134 226,120 200,120 C174,120 152,134 128,176 Z" fill={hj.dark} />
          <path d="M128,176 C152,134 174,120 200,120 C226,120 248,134 272,176 C268,150 258,128 244,112 C230,100 216,96 200,96 C184,96 170,100 156,112 C142,128 132,150 128,176 Z" fill={hj.main} opacity="0.55" />

          {/* eyeshadow */}
          {look.shadow && (<g opacity="0.55">
            <path d="M136,182 Q162,164 188,182 Q162,174 136,182Z" fill={look.shadow} />
            <path d="M212,182 Q238,164 264,182 Q238,174 212,182Z" fill={look.shadow} />
            <ellipse cx="162" cy="178" rx="24" ry="9" fill={look.shadow} /><ellipse cx="238" cy="178" rx="24" ry="9" fill={look.shadow} />
          </g>)}
          {/* eyes */}
          <g>
            <ellipse cx="162" cy="194" rx="17" ry="12" fill="#fff" /><ellipse cx="238" cy="194" rx="17" ry="12" fill="#fff" />
            <circle cx="162" cy="196" r="8" fill="#5B3A29" /><circle cx="238" cy="196" r="8" fill="#5B3A29" />
            <circle cx="162" cy="196" r="3.8" fill="#241611" /><circle cx="238" cy="196" r="3.8" fill="#241611" />
            <circle cx="165" cy="192" r="2.4" fill="#fff" /><circle cx="241" cy="192" r="2.4" fill="#fff" />
            <path d="M145,188 q17,-13 34,0 M221,188 q17,-13 34,0" stroke="#241611" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M147,184 l-6,-5 M255,184 l6,-5" stroke="#241611" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M142,168 q20,-10 40,-2 M218,166 q20,-8 40,2" stroke="#8A5A3B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </g>
          {/* nose + blush + lips */}
          <path d="M200,206 q5,14 -3,20 q4,4 10,1" stroke="#E8A87C" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          {look.blush && (<g opacity="0.65">
            <ellipse cx="140" cy="232" rx="17" ry="10" fill={look.blush} /><ellipse cx="260" cy="232" rx="17" ry="10" fill={look.blush} />
          </g>)}
          <g>
            <path d="M178,252 Q190,242 200,250 Q210,242 222,252 Q212,268 200,268 Q188,268 178,252Z" fill={look.lip} />
            <path d="M186,256 q14,6 28,0" stroke="#ffffff" strokeWidth="3" opacity="0.55" fill="none" strokeLinecap="round" />
          </g>
          <path d="M182,282 q18,10 36,0" stroke="#C97B5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />

          <Accessory id={look.acc} />

          {spark && (
            <g key={spark.k} transform={`translate(${spark.x} ${spark.y})`} className="pop-place">
              <path d="M0,-20 l5,13 13,5 -13,5 -5,13 -5,-13 -13,-5 13,-5 Z" fill="#FFD66E" />
              <circle cx="-24" cy="-12" r="4" fill="#FF8FBF" /><circle cx="24" cy="10" r="4" fill="#7EC8F7" /><circle cx="18" cy="-18" r="3" fill="#FFB7D5" />
            </g>
          )}
          <path d="M52,70 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z" fill="#FFD66E" className="sparkle" />
          <path d="M348,120 l2.4,5.6 5.6,2.4 -5.6,2.4 -2.4,5.6 -2.4,-5.6 -5.6,-2.4 5.6,-2.4 Z" fill="#FFB7D5" className="sparkle" />

          {/* TAP ZONES — rendered LAST (topmost in the SVG) so nothing in
              the artwork can ever cover them. Each zone declares which
              tools it serves, and a tap is resolved against the ACTIVE
              tool's zones only. The head area is ONE zone serving both
              Hijab and Aksesori: it resolves to whichever of those tools
              is active. Eyelid zones are generous ellipses over each eye. */}
          <path d="M148,540 L166,368 Q200,344 234,368 L252,540 Z" className={zoneCls} onClick={() => tapZone("dress", 200, 470)}
            {...(tool === "dress" ? pulse : { fill: "transparent" })} />
          <path fillRule="evenodd" className={zoneCls} onClick={() => tapHead(200, 92)}
            d="M200,50 C114,50 90,128 94,212 C97,276 82,320 62,358 C112,386 288,386 338,358 C318,320 303,276 306,212 C310,128 286,50 200,50 Z M200,106 C246,106 276,146 276,196 C276,248 242,286 200,286 C158,286 124,248 124,196 C124,146 154,106 200,106 Z"
            {...(tool === "hijab" || tool === "acc" ? pulse : { fill: "transparent" })} />
          <rect x="112" y="24" width="176" height="66" className={zoneCls} onClick={() => tapHead(200, 57)}
            {...(tool === "hijab" || tool === "acc" ? pulse : { fill: "transparent" })} />
          <ellipse cx="162" cy="184" rx="38" ry="26" className={zoneCls} onClick={() => tapZone("shadow", 162, 180)} {...(tool === "shadow" ? pulse : { fill: "transparent" })} />
          <ellipse cx="238" cy="184" rx="38" ry="26" className={zoneCls} onClick={() => tapZone("shadow", 238, 180)} {...(tool === "shadow" ? pulse : { fill: "transparent" })} />
          <circle cx="140" cy="232" r="26" className={zoneCls} onClick={() => tapZone("blush", 140, 232)} {...(tool === "blush" ? pulse : { fill: "transparent" })} />
          <circle cx="260" cy="232" r="26" className={zoneCls} onClick={() => tapZone("blush", 260, 232)} {...(tool === "blush" ? pulse : { fill: "transparent" })} />
          <ellipse cx="200" cy="255" rx="32" ry="20" className={zoneCls} onClick={() => tapZone("lip", 200, 255)} {...(tool === "lip" ? pulse : { fill: "transparent" })} />

          {/* PHOTO — unmissable polaroid frame INSIDE the scene itself,
              with the caption bar across the bottom of the picture. */}
          {photo && (
            <g pointerEvents="none">
              <rect x="7" y="7" width="386" height="526" fill="none" stroke="#FFFFFF" strokeWidth="14" />
              <rect x="7" y="440" width="386" height="93" fill="#FFFFFF" />
              <text x="200" y="482" textAnchor="middle" fontSize="19" fontWeight="800" fill="#E7548F">Masya Allah, cantik sekali! 📸</text>
              <text x="200" y="512" textAnchor="middle" fontSize="14" fontWeight="700" fill="#7EC8F7">— Salon Hijab Cantik —</text>
            </g>
          )}
        </svg>
        </div>
        {photo && <p className="pb-3 text-center text-xl font-extrabold text-pink-500">Masya Allah, cantik sekali!</p>}
      </div>

      <p className="text-center text-base font-bold text-sky-700" aria-live="polite">{hint}</p>

      {/* tools */}
      <div className="card-cloud p-4">
        <div className="tray-scroll no-scrollbar">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" onClick={() => { setTool(t.id); setPending(null); }}
              className={`min-h-12 whitespace-nowrap rounded-full border-[3px] px-5 text-base font-extrabold shadow transition active:scale-95 ${tool === t.id ? "border-pink-400 bg-pink-100 text-pink-700" : "border-white bg-sky-100 text-sky-800"}`}>
              {t.name}
            </button>
          ))}
        </div>

        {/* palette per tool */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {tool === "blush" && (<>
            {BLUSH.map((c) => (<Swatch key={c} color={c} active={pending === c} onClick={() => setPending(c)} />))}
            <ClearBtn active={pending === "none"} onClick={() => setPending("none")} />
          </>)}
          {tool === "lip" && LIPS.map((c) => (<Swatch key={c} color={c} active={pending === c} onClick={() => setPending(c)} />))}
          {tool === "shadow" && (<>
            {SHADOWS.map((c) => (<Swatch key={c} color={c} active={pending === c} onClick={() => setPending(c)} />))}
            <ClearBtn active={pending === "none"} onClick={() => setPending("none")} />
          </>)}
          {tool === "hijab" && (<>
            {HIJABS.map((c, i) => (<Swatch key={c.name} color={c.main} label={c.name} active={pending === i} onClick={() => setPending(i)} />))}
            <span className="mx-1 h-8 w-0.5 rounded bg-sky-100" />
            {(["plain", "polka", "stripe"] as Pattern[]).map((pt) => (
              <button key={pt} type="button" onClick={() => setPattern(pt)}
                className={`min-h-12 rounded-full border-[3px] px-4 text-base font-extrabold active:scale-95 ${pattern === pt ? "border-sky-400 bg-sky-100 text-sky-800" : "border-white bg-white text-sky-700 shadow"}`}>
                {pt === "plain" ? "Polos" : pt === "polka" ? "Polkadot" : "Garis"}
              </button>
            ))}
          </>)}
          {tool === "dress" && DRESSES.map((c, i) => (<Swatch key={c.name} color={c.main} label={c.name} active={pending === i} onClick={() => setPending(i)} />))}
          {tool === "acc" && ACCS.map((a) => (
            <button key={a.id} type="button" onClick={() => setPending(a.id)}
              className={`min-h-12 rounded-full border-[3px] px-4 text-base font-extrabold active:scale-95 ${pending === a.id ? "border-pink-400 bg-pink-100 text-pink-700" : "border-white bg-sky-50 text-sky-800 shadow"}`}>
              {a.name}
            </button>
          ))}
        </div>
        {pending !== null && (
          <p className="mt-3 text-base font-extrabold text-pink-500">Sekarang ketuk {ZONE_FOR[tool]} untuk memakai! (1 token)</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={randomize} className="btn-candy btn-candy-white flex-1">Acak Cantik (2 token)</button>
        <button type="button" onClick={takePhoto} className="btn-candy flex-1">Foto Cantikku</button>
      </div>
      {photo && <button type="button" onClick={() => setPhoto(false)} className="btn-candy btn-candy-white">Dandan Lagi</button>}

      <EarnSheet open={earnOpen} rewardLabel="+1 Token" onEarn={() => setTokens((t) => t + 1)} onClose={() => setEarnOpen(false)} />
    </div>
  );
}

function Swatch({ color, label, active, onClick }: { color: string; label?: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label ?? color}
      className={`grid min-h-12 min-w-12 place-items-center rounded-full border-[3px] shadow transition active:scale-90 ${active ? "border-sky-500 ring-4 ring-sky-200" : "border-white"}`}
      style={{ background: color }}>
      {label && <span className="px-2 text-[13px] font-extrabold text-sky-950/70">{label}</span>}
    </button>
  );
}
function ClearBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`min-h-12 rounded-full border-[3px] px-4 text-base font-extrabold active:scale-95 ${active ? "border-sky-500 bg-sky-100 text-sky-800" : "border-white bg-white text-sky-700 shadow"}`}>
      Hapus
    </button>
  );
}
