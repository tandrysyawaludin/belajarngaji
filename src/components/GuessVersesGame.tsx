"use client";

import { useEffect, useRef, useState } from "react";
import { type Surah } from "@/data/surahs";
import { strings } from "@/lib/strings";
import { shuffle } from "@/lib/random";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, type Player } from "@/lib/players";
import { useHotseat } from "@/lib/useHotseat";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { ThemedMascot } from "./ThemedMascot";
import { TurnBanner } from "./TurnBanner";

const MAX_QUESTIONS = 8;
const OPTIONS = 4;
const MULTI_QUESTIONS_PER_PLAYER = 5;

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

function buildSessionOfLength(scope: Surah[], length: number): Question[] {
  const out: Question[] = [];
  let pool: Surah[] = [];
  for (let i = 0; i < length; i++) {
    if (pool.length === 0) pool = shuffle([...scope]);
    const surah = pool.pop() as Surah;
    out.push({ surah, options: buildOptions(surah.verses) });
  }
  return out;
}

export function GuessVersesGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const multi = isMultiplayer(players);
  const questionsPerPlayer = multi
    ? MULTI_QUESTIONS_PER_PLAYER
    : Math.min(MAX_QUESTIONS, Math.max(1, scope.length));
  const totalQuestions = questionsPerPlayer * players.length;

  const hot = useHotseat(players, questionsPerPlayer);
  const [session, setSession] = useState<Question[]>(() =>
    buildSessionOfLength(scope, totalQuestions),
  );
  const [chosen, setChosen] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);

  const index = hot.questionNumber;
  const finished = hot.isOver;
  const current = session[index];

  const handleChoose = (option: number) => {
    if (chosen !== null) return;
    const correct = option === current.surah.verses;
    setChosen(option);
    setFeedback(correct ? "correct" : "wrong");
    hot.recordResult(correct);
    setAnswers((a) => [
      ...a,
      {
        prompt: `Berapa ayat dalam ${current.surah.name}?`,
        yourAnswer: `${option} ayat`,
        correctAnswer: `${current.surah.verses} ayat`,
        correct,
      },
    ]);
  };

  const handleNext = () => {
    setChosen(null);
    setFeedback(null);
    hot.next();
  };

  const restart = () => {
    setSession(buildSessionOfLength(scope, totalQuestions));
    hot.reset();
    setChosen(null);
    setFeedback(null);
    setAnswers([]);
  };

  if (finished) {
    if (multi) {
      return (
        <MultiplayerResult
          players={hot.players}
          gameId="tebak-ayat"
          scope={scope}
          total={questionsPerPlayer}
          onRestart={restart}
        />
      );
    }
    return (
      <ResultCard
        score={hot.players[0].score}
        total={totalQuestions}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {multi ? (
        <TurnBanner players={hot.players} currentIndex={hot.turnIndex} />
      ) : (
        <div className="rounded-2xl bg-white/85 p-3 px-4 shadow ring-2 ring-pink-100">
          <p className="text-sm font-bold text-pink-800">
            Soal {index + 1} / {totalQuestions} • Skor:{" "}
            <span className="text-emerald-600">{hot.players[0].score}</span>
          </p>
        </div>
      )}

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
              {index + 1 === totalQuestions ? strings.finishButton : strings.nextButton} →
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
  const message =
    pct === 100
      ? strings.perfectScore
      : pct >= 70
        ? strings.goodJob
        : strings.keepTrying;

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "tebak-ayat",
      score,
      total,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [score, total, answers, scope]);

  useEffect(() => {
    if (pct === 100) {
      import("./Feedback").then(({ fireConfetti }) => fireConfetti());
    }
  }, [pct]);

  return (
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-violet-100 via-pink-100 to-yellow-100 p-8 text-center shadow-lg ring-4 ring-white/60">
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
