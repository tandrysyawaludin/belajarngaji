"use client";

import { useEffect, useState } from "react";
import { type Surah } from "@/data/surahs";
import { strings } from "@/lib/strings";
import { sampleUnique, shuffle } from "@/lib/random";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { Mascot } from "./Mascot";

const MAX_QUESTIONS = 8;
const OPTIONS = 4;

interface Question {
  surah: Surah;
  options: number[];
}

function buildOptions(correct: number): number[] {
  const pool = new Set<number>();
  pool.add(correct);
  let attempts = 0;
  while (pool.size < OPTIONS && attempts < 30) {
    attempts += 1;
    const delta = Math.max(1, Math.round(Math.random() * Math.max(4, correct / 2)));
    const candidate = Math.random() < 0.5 ? correct + delta : correct - delta;
    if (candidate >= 3 && candidate <= 60 && candidate !== correct) pool.add(candidate);
  }
  // Fallback: just add small unique numbers.
  let n = 3;
  while (pool.size < OPTIONS) {
    if (!pool.has(n)) pool.add(n);
    n += 1;
  }
  return shuffle(Array.from(pool));
}

function buildSession(scope: Surah[]): Question[] {
  const count = Math.min(MAX_QUESTIONS, Math.max(1, scope.length));
  return sampleUnique(scope, count).map((surah) => ({
    surah,
    options: buildOptions(surah.verses),
  }));
}

export function GuessVersesGame({ scope }: { scope: Surah[] }) {
  const [session, setSession] = useState<Question[]>(() => buildSession(scope));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);

  const finished = index >= session.length;
  const current = session[index];

  const handleChoose = (option: number) => {
    if (chosen !== null) return;
    const correct = option === current.surah.verses;
    setChosen(option);
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setChosen(null);
    setFeedback(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setSession(buildSession(scope));
    setIndex(0);
    setScore(0);
    setChosen(null);
    setFeedback(null);
  };

  if (finished) {
    return <ResultCard score={score} total={session.length} onRestart={restart} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white/85 p-3 px-4 shadow ring-2 ring-pink-100">
        <p className="text-sm font-bold text-pink-800">
          Soal {index + 1} / {session.length} • Skor:{" "}
          <span className="text-emerald-600">{score}</span>
        </p>
      </div>

      <article className="rounded-3xl bg-white/95 p-6 shadow-lg ring-4 ring-pink-100">
        <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
          {strings.guessVersesPrompt}
        </p>
        <h2 className="mt-2 flex items-center justify-between gap-3">
          <span className="text-2xl font-extrabold text-pink-700 sm:text-3xl">
            {current.surah.name}
          </span>
          <span className="arabic text-pink-700">{current.surah.arabic}</span>
        </h2>
        <p className="mt-1 text-sm font-semibold text-pink-900/70">
          {strings.meaningLabel}: {current.surah.meaning}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {current.options.map((opt) => {
            const isChosen = chosen === opt;
            const isCorrect = opt === current.surah.verses;
            const base =
              "rounded-2xl p-4 text-center text-2xl font-extrabold shadow-sm ring-2 transition active:scale-[0.97]";
            let style =
              "bg-white text-pink-900 ring-pink-100 hover:bg-pink-50 hover:ring-pink-200";
            if (chosen !== null) {
              if (isCorrect)
                style =
                  "bg-emerald-200 text-emerald-900 ring-emerald-300 pop-in";
              else if (isChosen)
                style = "bg-red-200 text-red-900 ring-red-300 shake";
              else style = "bg-white/70 text-pink-900/60 ring-pink-100";
            }
            return (
              <button
                key={opt}
                type="button"
                disabled={chosen !== null}
                onClick={() => handleChoose(opt)}
                className={`${base} ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {chosen !== null && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-bold text-pink-800">
              Jawaban yang benar:{" "}
              <span className="underline">{current.surah.verses} ayat</span>
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-pink-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
            >
              {index + 1 === session.length ? strings.finishButton : strings.nextButton} →
            </button>
          </div>
        )}
      </article>
      <FeedbackOverlay kind={feedback} onDone={() => setFeedback(null)} />
    </div>
  );
}

function ResultCard({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const pct = (score / total) * 100;
  const mood = pct >= 70 ? "excited" : pct >= 40 ? "happy" : "sad";
  const message =
    pct === 100
      ? strings.perfectScore
      : pct >= 70
        ? strings.goodJob
        : strings.keepTrying;

  useEffect(() => {
    if (pct === 100) {
      import("./Feedback").then(({ fireConfetti }) => fireConfetti());
    }
  }, [pct]);

  return (
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-violet-100 via-pink-100 to-yellow-100 p-8 text-center shadow-lg ring-4 ring-white/60">
      <Mascot size={140} mood={mood} className="wobble" />
      <h2 className="text-3xl font-extrabold text-pink-700">{message}</h2>
      <p className="text-xl font-bold text-pink-900">
        {strings.scoreLabel}:{" "}
        <span className="text-emerald-600">{score}</span> / {total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-pink-500 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
      >
        🎉 {strings.playAgain}
      </button>
    </article>
  );
}
