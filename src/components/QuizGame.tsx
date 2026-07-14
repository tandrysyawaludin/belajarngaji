"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SURAHS, type Surah } from "@/data/surahs";
import { useStrings } from "@/components/LocaleProvider";
import { sampleUnique, shuffle } from "@/lib/random";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, type Player } from "@/lib/players";
import { useHotseat } from "@/lib/useHotseat";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { ThemedMascot } from "./ThemedMascot";
import { TurnBanner } from "./TurnBanner";

const TOTAL_QUESTIONS = 10;
const OPTIONS_PER_QUESTION = 4;
const MULTI_QUESTIONS_PER_PLAYER = 5;

interface Question {
  surah: Surah;
  options: string[];
  correct: string;
}

function buildQuestion(scope: Surah[], used: Set<number>): Question {
  const pool = scope.filter((s) => !used.has(s.number));
  const choices = pool.length ? pool : scope;
  const surah = choices[Math.floor(Math.random() * choices.length)];
  // Distractors are drawn from ALL surahs so the kid actually has to know the
  // meaning of the surah in scope rather than recognize it by elimination.
  const distractors = sampleUnique(
    SURAHS.filter((s) => s.meaning !== surah.meaning).map((s) => s.meaning),
    OPTIONS_PER_QUESTION - 1,
  );
  const uniqueDistractors = Array.from(new Set(distractors)).slice(
    0,
    OPTIONS_PER_QUESTION - 1,
  );
  return {
    surah,
    correct: surah.meaning,
    options: shuffle([surah.meaning, ...uniqueDistractors]),
  };
}

function buildSessionOfLength(scope: Surah[], length: number): Question[] {
  // Cycle through the scope so each player gets fresh surahs; only repeat once
  // the whole scope has been used in the current session.
  const used = new Set<number>();
  const questions: Question[] = [];
  for (let i = 0; i < length; i++) {
    if (used.size >= scope.length) used.clear();
    const q = buildQuestion(scope, used);
    used.add(q.surah.number);
    questions.push(q);
  }
  return questions;
}

type AnswerState =
  | { phase: "answering" }
  | { phase: "revealed"; chosen: string; correct: boolean };

export function QuizGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const multi = isMultiplayer(players);
  const questionsPerPlayer = multi
    ? MULTI_QUESTIONS_PER_PLAYER
    : Math.min(TOTAL_QUESTIONS, Math.max(1, scope.length));
  const totalQuestions = questionsPerPlayer * players.length;

  const hot = useHotseat(players, questionsPerPlayer);
  const [session, setSession] = useState<Question[]>(() =>
    buildSessionOfLength(scope, totalQuestions),
  );
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answer, setAnswer] = useState<AnswerState>({ phase: "answering" });
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);

  const index = hot.questionNumber;
  const current = session[index];
  const finished = hot.isOver;

  const handleChoose = (option: string) => {
    if (answer.phase !== "answering") return;
    const correct = option === current.correct;
    setAnswer({ phase: "revealed", chosen: option, correct });
    setFeedback(correct ? "correct" : "wrong");
    hot.recordResult(correct);
    setAnswers((a) => [
      ...a,
      {
        prompt: `${strings.quizPrompt} ${current.surah.name}?`,
        yourAnswer: option,
        correctAnswer: current.correct,
        correct,
      },
    ]);
  };

  const handleNext = () => {
    setAnswer({ phase: "answering" });
    setFeedback(null);
    hot.next();
  };

  const restart = () => {
    setSession(buildSessionOfLength(scope, totalQuestions));
    hot.reset();
    setAnswer({ phase: "answering" });
    setFeedback(null);
    setAnswers([]);
  };

  if (finished) {
    if (multi) {
      return (
        <MultiplayerResult
          players={hot.players}
          gameId="kuis"
          scope={scope}
          total={questionsPerPlayer}
          onRestart={restart}
        />
      );
    }
    return (
      <Result
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
        <ScoreBar
          index={index}
          total={totalQuestions}
          score={hot.players[0].score}
        />
      )}
      <article className="rounded-3xl bg-white/95 p-6 shadow-lg ring-4 ring-pink-100">
        <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
          Pertanyaan {index + 1} dari {totalQuestions}
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-pink-700 sm:text-2xl">
          {strings.quizPrompt}{" "}
          <span className="text-pink-900">{current.surah.name}</span>?
        </h2>
        <p className="arabic mt-1 text-pink-600">{current.surah.arabic}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {current.options.map((option) => {
            const isChosen =
              answer.phase === "revealed" && answer.chosen === option;
            const isCorrect =
              answer.phase === "revealed" && option === current.correct;
            const base =
              "rounded-2xl px-5 py-4 text-left text-base font-bold shadow-sm ring-2 transition active:scale-[0.98]";
            let style =
              "bg-white text-pink-900 ring-pink-100 hover:bg-pink-50 hover:ring-pink-200";
            if (answer.phase === "revealed") {
              if (isCorrect)
                style =
                  "bg-emerald-200 text-emerald-900 ring-emerald-300 pop-in";
              else if (isChosen)
                style = "bg-red-200 text-red-900 ring-red-300 shake";
              else style = "bg-white/70 text-pink-900/60 ring-pink-100";
            }
            return (
              <button
                key={option}
                type="button"
                disabled={answer.phase === "revealed"}
                onClick={() => handleChoose(option)}
                className={`${base} ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {answer.phase === "revealed" && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-bold text-pink-800">
              {strings.historyCorrectAnswer}: <span className="underline">{current.correct}</span>
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

function ScoreBar({
  index,
  total,
  score,
}: {
  index: number;
  total: number;
  score: number;
}) {
  const strings = useStrings();
  const pct = Math.max(0, Math.min(100, (index / total) * 100));
  return (
    <div className="rounded-2xl bg-white/85 p-3 shadow ring-2 ring-pink-100">
      <div className="flex items-center justify-between text-sm font-bold text-pink-800">
        <span>
          {strings.scoreLabel}: <span className="text-emerald-600">{score}</span>{" "}
          / {total}
        </span>
        <span className="text-pink-400">
          {index + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-pink-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Result({
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
  const strings = useStrings();
  const pct = (score / total) * 100;
  const message = useMemo(() => {
    if (pct === 100) return strings.perfectScore;
    if (pct >= 70) return strings.goodJob;
    return strings.keepTrying;
  }, [pct, strings]);
  const mood = pct >= 70 ? "excited" : pct >= 40 ? "happy" : "sad";

  // Persist this session into history exactly once per Result mount.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "kuis",
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
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-pink-100 via-yellow-100 to-emerald-100 p-8 text-center shadow-lg ring-4 ring-white/60">
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
