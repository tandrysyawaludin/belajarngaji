"use client";

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { SURAHS } from "@/data/surahs";
import { getScopedSurahs } from "@/lib/surahScope";

export const HIJAIYAH: { arabic: string; name: string }[] = [
  { arabic: "ا", name: "Alif" },
  { arabic: "ب", name: "Ba" },
  { arabic: "ت", name: "Ta" },
  { arabic: "ث", name: "Tsa" },
  { arabic: "ج", name: "Jim" },
  { arabic: "ح", name: "Ha" },
  { arabic: "خ", name: "Kha" },
  { arabic: "د", name: "Dal" },
];

export interface KidQ {
  prompt: string;
  arabic?: string;
  choices: string[];
  answer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeQuestion(): KidQ {
  const kind = Math.floor(Math.random() * 3);
  if (kind === 2) {
    // Hijaiyah-letter questions are never scoped.
    const letter = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)];
    const wrong = shuffle(HIJAIYAH.filter((h) => h.name !== letter.name)).slice(0, 2).map((h) => h.name);
    return {
      prompt: "Huruf hijaiyah apa ini?",
      arabic: letter.arabic,
      choices: shuffle([letter.name, ...wrong]),
      answer: letter.name,
    };
  }
  // Surah-based questions only ever ask about surahs inside the child's
  // chosen scope (intersected with the SHORT pool; see lib/surahScope).
  const pool = getScopedSurahs();
  const surah = pool[Math.floor(Math.random() * pool.length)];
  if (kind === 1) {
    const opts = new Set<number>([surah.verses]);
    while (opts.size < 3) opts.add(Math.max(1, surah.verses + Math.floor(Math.random() * 9) - 4));
    return {
      prompt: `Berapa jumlah ayat surah ${surah.name}?`,
      choices: shuffle([...opts].map(String)),
      answer: String(surah.verses),
    };
  }
  // Meaning distractors prefer other in-scope surahs when there are enough
  // of them; otherwise fall back to the general pool. The answer itself is
  // always the in-scope surah's meaning.
  const distractorPool = pool.length >= 3 ? pool : SURAHS;
  const wrong = shuffle(
    Array.from(new Set(distractorPool.filter((s) => s.meaning !== surah.meaning).map((s) => s.meaning))),
  ).slice(0, 2);
  return {
    prompt: `Apa arti surah ${surah.name}?`,
    choices: shuffle([surah.meaning, ...wrong]),
    answer: surah.meaning,
  };
}

/** Gentle 3-choice question: wrong answers only encourage a retry, never punish. */
export function KidQuestion({ onCorrect, cta = "Kumpulkan hadiahku ✨" }: { onCorrect: () => void; cta?: string }) {
  const [q, setQ] = useState<KidQ>(() => makeQuestion());
  const [state, setState] = useState<"ask" | "wrong" | "right">("ask");
  const choices = useMemo(() => q.choices, [q]);

  const pick = (c: string) => {
    if (state === "right") return;
    if (c === q.answer) {
      setState("right");
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"] });
    } else {
      setState("wrong");
    }
  };

  return (
    <div className="rounded-[2rem] bg-white/95 p-5 shadow-lg ring-4 ring-sky-100">
      <p className="text-center text-sm font-extrabold uppercase tracking-wide text-sky-500">⭐ Soal Bintang ⭐</p>
      <p className="mt-2 text-center text-xl font-extrabold text-sky-900">{q.prompt}</p>
      {q.arabic && <p className="arabic mt-1 text-center text-sky-900">{q.arabic}</p>}
      <div className="mt-4 grid gap-3">
        {choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pick(c)}
            className={`min-h-14 rounded-full px-5 py-3 text-lg font-extrabold shadow transition active:scale-95 ${
              state === "right" && c === q.answer
                ? "bg-emerald-400 text-white"
                : "bg-sky-100 text-sky-900 hover:bg-sky-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {state === "wrong" && (
        <p className="mt-3 text-center text-base font-bold text-pink-500">Hampir! Kamu pasti bisa, coba lagi ya sayang 💪☁️</p>
      )}
      {state === "right" && (
        <div className="mt-4 text-center">
          <p className="text-lg font-extrabold text-emerald-600">Masya Allah, benar! 🎉</p>
          <button
            type="button"
            onClick={() => { onCorrect(); setQ(makeQuestion()); setState("ask"); }}
            className="mt-3 min-h-14 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 px-6 py-3 text-lg font-extrabold text-white shadow-lg transition active:scale-95"
          >
            {cta}
          </button>
        </div>
      )}
    </div>
  );
}
