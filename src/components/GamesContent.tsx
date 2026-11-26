"use client";

import Link from "next/link";
import { useStrings } from "@/components/LocaleProvider";
import { GAME_CARD_DEFS } from "@/lib/games";
import { CloudPuppy } from "@/components/CloudPuppy";

export function GamesContent() {
  const strings = useStrings();

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-center gap-4 rounded-[2rem] bg-white/90 p-5 shadow-md ring-4 ring-sky-100">
        <span className="floaty shrink-0"><CloudPuppy size={76} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-sky-600 sm:text-3xl">{strings.navGames}</h1>
          <p className="mt-1 text-base font-semibold text-sky-900/70">{strings.gamesIntro}</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAME_CARD_DEFS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-xl ring-4 ring-white/50 transition hover:scale-[1.02] active:scale-95 ${c.bg}`}
          >
            <div className="dotted absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/90 shadow-inner ring-2 ring-white transition group-hover:scale-110"><GameIcon href={c.href} /></span>
              <div>
                <h2 className="text-2xl font-extrabold drop-shadow-sm">{strings[c.titleKey]}</h2>
                <p className="mt-2 text-base font-semibold leading-snug text-white/95">{strings[c.descKey]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GameIcon({ href }: { href: string }) {
  if (href === "/memori") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><rect x="5" y="10" width="24" height="30" rx="5" fill="#7EC8F7" stroke="#2F7FC4" strokeWidth="2.4" transform="rotate(-8 17 25)" /><rect x="20" y="8" width="24" height="30" rx="5" fill="#fff" stroke="#FF8FBF" strokeWidth="2.4" transform="rotate(7 32 23)" /><text x="32" y="31" textAnchor="middle" fontSize="16" fontWeight="800" fill="#E7548F">ب</text><path d="M13 17 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4Z" fill="#FFD66E" /></svg>);
  if (href === "/hubungkan") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><rect x="4" y="6" width="18" height="18" rx="5" fill="#BFE6FF" stroke="#2F7FC4" strokeWidth="2.2" /><rect x="26" y="24" width="18" height="18" rx="5" fill="#FFE3F0" stroke="#E7548F" strokeWidth="2.2" /><text x="13" y="20" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2F7FC4">ت</text><text x="35" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill="#E7548F">ت</text><path d="M22 20 Q30 14 27 25" fill="none" stroke="#FFD66E" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" /></svg>);
  if (href === "/mewarnai") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M10 38 L30 10 l8 8 L18 42 l-9 3 Z" fill="#FFD66E" stroke="#E8A93D" strokeWidth="2.2" strokeLinejoin="round" /><path d="M30 10 l8 8 -5 2 -5 -5 Z" fill="#FF8FBF" /><path d="M10 38 l-1 7 6 -3 Z" fill="#2F7FC4" /><circle cx="38" cy="36" r="5" fill="#3FBFB2" /><circle cx="28" cy="42" r="3.4" fill="#FF6B6B" /></svg>);
  if (href === "/simon") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M14 5 l2.2 4.8 4.8 2.2 -4.8 2.2 -2.2 4.8 -2.2 -4.8 -4.8 -2.2 4.8 -2.2Z" fill="#FFD66E" stroke="#E8A93D" strokeWidth="1.8" strokeLinejoin="round" /><path d="M37 7 a6 6 0 1 0 2 11 a4.8 4.8 0 1 1 -2 -11Z" fill="#7EC8F7" stroke="#2F7FC4" strokeWidth="1.8" /><path d="M11 33 a6 6 0 1 1 1.4 -11.8 A7.5 7.5 0 0 1 26 20 a5.6 5.6 0 1 1 .8 13 Z" fill="#FFB7D5" stroke="#E7548F" strokeWidth="1.8" /><path d="M36 41 c-5 -3.6 -7 -6 -7 -8.8 0 -2.2 1.8 -3.7 3.7 -3.7 1.4 0 2.7.8 3.3 2 .6 -1.2 1.9 -2 3.3 -2 1.9 0 3.7 1.5 3.7 3.7 0 2.8 -2 5.2 -7 8.8Z" fill="#3FBFB2" stroke="#2AA79B" strokeWidth="1.8" strokeLinejoin="round" /></svg>);
  if (href === "/dekorasi") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M6 22 L24 8 L42 22" fill="none" stroke="#F08BB8" strokeWidth="5" strokeLinecap="round" /><rect x="12" y="22" width="24" height="16" rx="3" fill="#7EC8F7" /><rect x="20" y="28" width="8" height="10" rx="2" fill="#fff" /><path d="M24 12 l1.8 3.8 3.8 1.8 -3.8 1.8 -1.8 3.8 -1.8 -3.8 -3.8 -1.8 3.8 -1.8Z" fill="#FFD66E" /></svg>);
  if (href === "/salon") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M24 24 L8 12 Q2 24 8 36 Z" fill="#FF8FBF" stroke="#E7548F" strokeWidth="2.6" strokeLinejoin="round" /><path d="M24 24 L40 12 Q46 24 40 36 Z" fill="#FF8FBF" stroke="#E7548F" strokeWidth="2.6" strokeLinejoin="round" /><circle cx="24" cy="24" r="7" fill="#E7548F" /><circle cx="24" cy="24" r="2.8" fill="#FFD3E8" /><circle cx="14" cy="40" r="4" fill="#FFD66E" /><circle cx="34" cy="40" r="4" fill="#7EC8F7" /></svg>);
  if (href === "/kue") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><rect x="8" y="30" width="32" height="10" rx="3" fill="#FF8FBF" /><rect x="13" y="21" width="22" height="9" rx="3" fill="#FFD3E8" /><rect x="18" y="13" width="12" height="8" rx="3" fill="#fff" stroke="#FFB7D5" strokeWidth="2" /><path d="M24 5 v4" stroke="#FFD66E" strokeWidth="3" strokeLinecap="round" /><circle cx="24" cy="4" r="2.4" fill="#FF6B6B" /><circle cx="15" cy="34" r="2" fill="#fff" /><circle cx="24" cy="25" r="2" fill="#FF8FBF" /><circle cx="33" cy="34" r="2" fill="#fff" /></svg>);
  if (href === "/huruf-awan") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M14 34 a8 8 0 1 1 2-15.8 A10 10 0 0 1 35 16 a7.5 7.5 0 1 1 1 18 Z" fill="#7EC8F7" stroke="#2F7FC4" strokeWidth="2.4" /><text x="24" y="31" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">ب</text></svg>);
  if (href === "/puzzle") return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><rect x="6" y="6" width="17" height="17" rx="4" fill="#FFB84D" /><rect x="25" y="6" width="17" height="17" rx="4" fill="#7EC8F7" /><rect x="6" y="25" width="17" height="17" rx="4" fill="#3FBFB2" /><rect x="25" y="25" width="17" height="17" rx="4" fill="#FF8FBF" /><path d="M20 34 h5 M34 20 v5" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>);
  return (<svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true"><path d="M10 40 V26 a14 12 0 0 1 28 0 V40 Z" fill="#3FBFB2" /><rect x="6" y="38" width="36" height="5" rx="2" fill="#2F7FC4" /><path d="M27 8 a5.5 5.5 0 1 0 3.4 9.4 A4.4 4.4 0 1 1 27 8Z" fill="#FFD66E" /><rect x="20" y="30" width="8" height="9" rx="4" fill="#fff" /></svg>);
}
