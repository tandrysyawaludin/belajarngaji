"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { JUZ30_CHAPTERS, JUZ30_NUMBERS, type Juz30Verse } from "@/data/juz30";
import { getSurah, type Surah } from "@/data/surahs";
import { strings } from "@/lib/strings";
import { sampleUnique, shuffle, pick } from "@/lib/random";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { FeedbackOverlay, type FeedbackKind, fireConfetti } from "./Feedback";
import { ThemedMascot } from "./ThemedMascot";

const TOTAL = 8;
const OPTIONS = 4;

interface Question {
  surah: Surah;
  current: Juz30Verse;
  answer: Juz30Verse;
  options: Juz30Verse[];
}

function buildQuestion(
  positions: Array<{ chapter: number; index: number }>,
  distractorPool: Array<{ chapter: number; verse: Juz30Verse }>,
): Question | null {
  if (!positions.length) return null;
  const pos = pick(positions);
  const verses = JUZ30_CHAPTERS[pos.chapter];
  const surah = getSurah(pos.chapter);
  if (!surah || !verses) return null;
  const current = verses[pos.index];
  const answer = verses[pos.index + 1];

  // Draw 3 distractors from the scope, skipping the answer/current verse and
  // any rare duplicate Arabic text. Falling back to the full juz-30 pool keeps
  // the game playable when the kid picked only one short surah.
  const filterFn = (v: { chapter: number; verse: Juz30Verse }) =>
    v.verse.arabic !== answer.arabic &&
    v.verse.arabic !== current.arabic &&
    !(v.chapter === pos.chapter && v.verse.verse === answer.verse);
  let candidates = distractorPool.filter(filterFn);
  if (candidates.length < OPTIONS - 1) {
    const wholeJuz30 = JUZ30_NUMBERS.flatMap((c) =>
      (JUZ30_CHAPTERS[c] ?? []).map((verse) => ({ chapter: c, verse })),
    );
    candidates = wholeJuz30.filter(filterFn);
  }
  const distractors = sampleUnique(candidates, OPTIONS - 1).map((v) => v.verse);
  const options = shuffle([answer, ...distractors]);

  return { surah, current, answer, options };
}

interface Pools {
  positions: Array<{ chapter: number; index: number }>;
  distractors: Array<{ chapter: number; verse: Juz30Verse }>;
}

function buildPools(scope: Surah[]): Pools {
  const scopeNumbers = new Set(scope.map((s) => s.number));
  const positions = JUZ30_NUMBERS.filter((c) => scopeNumbers.has(c)).flatMap(
    (chapter) => {
      const verses = JUZ30_CHAPTERS[chapter];
      if (!verses || verses.length < 2) return [];
      return verses.slice(0, -1).map((_, i) => ({ chapter, index: i }));
    },
  );
  const distractors = JUZ30_NUMBERS.filter((c) => scopeNumbers.has(c)).flatMap(
    (chapter) =>
      (JUZ30_CHAPTERS[chapter] ?? []).map((verse) => ({ chapter, verse })),
  );
  return { positions, distractors };
}

function buildSession(scope: Surah[]): Question[] {
  const pools = buildPools(scope);
  const out: Question[] = [];
  let attempts = 0;
  while (out.length < TOTAL && attempts < TOTAL * 4) {
    attempts += 1;
    const q = buildQuestion(pools.positions, pools.distractors);
    if (q) out.push(q);
  }
  return out;
}

export function SambungAyatGame({ scope }: { scope: Surah[] }) {
  const [session, setSession] = useState<Question[]>(() => buildSession(scope));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);

  const finished = index >= session.length;
  const current = session[index];

  const handleChoose = (option: Juz30Verse) => {
    if (chosen !== null || !current) return;
    const correct = option.arabic === current.answer.arabic;
    setChosen(option.arabic);
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [
      ...a,
      {
        prompt: `${current.surah.name} ayat ${current.current.verse} → lanjutannya?`,
        yourAnswer: option.arabic,
        correctAnswer: current.answer.arabic,
        correct,
      },
    ]);
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
    setAnswers([]);
  };

  if (finished) {
    return (
      <ResultCard
        score={score}
        total={session.length}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white/85 p-3 px-4 shadow ring-2 ring-pink-100">
        <p className="text-sm font-bold text-pink-800">
          Soal {index + 1} / {session.length} • Skor:{" "}
          <span className="text-emerald-600">{score}</span>
        </p>
      </div>

      <article className="rounded-3xl bg-white/95 p-6 shadow-lg ring-4 ring-pink-100">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
            Surah {current.surah.name} • ayat {current.current.verse}
          </p>
          <span className="arabic text-base text-pink-600">
            {current.surah.arabic}
          </span>
        </header>

        <div className="mt-3 rounded-2xl bg-pink-50/70 p-4 ring-2 ring-pink-100">
          <p className="arabic text-right text-pink-900">
            {current.current.arabic}
          </p>
          {current.current.translation && (
            <p className="mt-3 border-t border-pink-100 pt-3 text-sm font-semibold leading-relaxed text-slate-700">
              {current.current.translation}
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-base font-extrabold text-pink-700">
          ↓ {strings.connectPrompt} ↓
        </p>

        <div className="mt-3 grid gap-3">
          {current.options.map((option, i) => {
            const isChosen = chosen === option.arabic;
            const isCorrect =
              chosen !== null && option.arabic === current.answer.arabic;
            const base =
              "rounded-2xl px-4 py-3 text-right shadow-sm ring-2 transition active:scale-[0.99]";
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
                key={`${option.arabic}-${i}`}
                type="button"
                disabled={chosen !== null}
                onClick={() => handleChoose(option)}
                className={`${base} ${style} flex items-center gap-3`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100 text-sm font-extrabold text-pink-700">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="arabic flex-1 text-right text-lg leading-loose">
                  {option.arabic}
                </span>
              </button>
            );
          })}
        </div>

        {chosen !== null && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-bold text-pink-800">
              Ayat ke-{current.answer.verse}:{" "}
              <span className="italic">{current.answer.translation}</span>
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="shrink-0 rounded-full bg-pink-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
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
  answers,
  scope,
  onRestart,
}: {
  score: number;
  total: number;
  answers: HistoryAnswer[];
  scope: Surah[];
  onRestart: () => void;
}) {
  const pct = (score / total) * 100;
  const mood = pct >= 70 ? "excited" : pct >= 40 ? "happy" : "sad";
  const message = useMemo(() => {
    if (pct === 100) return strings.perfectScore;
    if (pct >= 70) return strings.goodJob;
    return strings.keepTrying;
  }, [pct]);

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "sambung",
      score,
      total,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [score, total, answers, scope]);

  useEffect(() => {
    if (pct === 100) fireConfetti();
  }, [pct]);

  return (
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-sky-100 via-pink-100 to-yellow-100 p-8 text-center shadow-lg ring-4 ring-white/60">
      <ThemedMascot size={140} mood={mood} className="wobble" />
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
