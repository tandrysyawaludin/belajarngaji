"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import { useFormat, useStrings } from "@/components/LocaleProvider";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, type Player } from "@/lib/players";
import {
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import { useHotseat } from "@/lib/useHotseat";
import { FeedbackOverlay, fireConfetti, type FeedbackKind } from "./Feedback";
import type { KitchenStage } from "./FoodKitchen";
import { MultiplayerResult } from "./MultiplayerResult";
import { ThemedMascot } from "./ThemedMascot";
import { TurnBanner } from "./TurnBanner";

const TOTAL_QUESTIONS = 10;

const FoodKitchen = dynamic(
  () => import("./FoodKitchen").then((mod) => mod.FoodKitchen),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-6xl" aria-hidden="true">
        🍔
      </div>
    ),
  },
);

type Phase = "answering" | "cooking" | "serving" | "wrong";

function buildSession(scope: Surah[], length: number): SnakeLadderQuestion[] {
  const out: SnakeLadderQuestion[] = [];
  let used = new Set<string>();
  for (let i = 0; i < length; i++) {
    let question: SnakeLadderQuestion;
    try {
      question = buildSnakeLadderQuestion(scope, Math.random, used);
    } catch {
      used = new Set();
      question = buildSnakeLadderQuestion(scope, Math.random, used);
    }
    used = new Set(used);
    used.add(getSnakeLadderQuestionKey(question));
    out.push(question);
  }
  return out;
}

export function BurgerGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const format = useFormat();
  const multi = isMultiplayer(players);
  const questionsPerPlayer = TOTAL_QUESTIONS;
  const totalQuestions = questionsPerPlayer * players.length;

  const hot = useHotseat(players, questionsPerPlayer);
  const [session, setSession] = useState<SnakeLadderQuestion[]>(() =>
    buildSession(scope, totalQuestions),
  );
  const [phase, setPhase] = useState<Phase>("answering");
  const [chosen, setChosen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);

  const index = hot.questionNumber;
  const current = session[index];
  const finished = hot.isOver;
  const showKitchen = phase === "cooking" || phase === "serving";
  const kitchenStage: KitchenStage = phase === "serving" ? "serve" : "cook";
  const nextTurn = hot.next;
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const goNext = useCallback(() => {
    setPhase("answering");
    setChosen(null);
    setFeedback(null);
    nextTurn();
  }, [nextTurn]);

  const handleFeedbackDone = useCallback(() => {
    setFeedback(null);
    if (phaseRef.current === "wrong") goNext();
  }, [goNext]);

  const handleChoose = (option: string) => {
    if (phase !== "answering" || !current) return;
    const correct = option === current.correctAnswer;
    setChosen(option);
    setAnswers((prev) => [
      ...prev,
      {
        prompt: current.prompt,
        yourAnswer: option,
        correctAnswer: current.correctAnswer,
        correct,
      },
    ]);
    hot.recordResult(correct);
    if (correct) {
      fireConfetti();
      setPhase("cooking");
      return;
    }
    setFeedback("wrong");
    setPhase("wrong");
  };

  const handleKitchenComplete = () => {
    if (phaseRef.current === "cooking") {
      setPhase("serving");
      return;
    }
    if (phaseRef.current === "serving") goNext();
  };

  const restart = () => {
    setSession(buildSession(scope, totalQuestions));
    hot.reset();
    setPhase("answering");
    setChosen(null);
    setFeedback(null);
    setAnswers([]);
  };

  if (finished) {
    if (multi) {
      return (
        <MultiplayerResult
          players={hot.players}
          gameId="tukang-burger"
          scope={scope}
          total={questionsPerPlayer}
          unit={strings.burgerOrdersUnit}
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

  const revealed = phase !== "answering";
  const statusText =
    phase === "cooking"
      ? strings.burgerCookHint
      : phase === "serving"
        ? strings.burgerServeHint
        : format(strings.burgerChanceLabel, {
            current: index + 1,
            total: totalQuestions,
          });

  return (
    <div className="flex flex-col gap-4">
      {multi ? (
        <TurnBanner players={hot.players} currentIndex={hot.turnIndex} />
      ) : (
        <ScoreBar
          index={index}
          total={totalQuestions}
          score={hot.players[0].score}
          answers={answers}
        />
      )}

      {showKitchen && (
        <KitchenPopup
          index={index}
          title={strings.burgerKitchenTitle}
          status={statusText}
          stage={kitchenStage}
          onStageComplete={handleKitchenComplete}
        />
      )}
      <ChanceRow total={totalQuestions} answers={answers} />

      <article className="burger-wood-panel p-5 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wider text-orange-800">
          {format(strings.burgerChanceLabel, {
            current: index + 1,
            total: totalQuestions,
          })}
        </p>
        <h3 className="mt-2 text-xl font-extrabold text-amber-950 sm:text-2xl">
          {current.prompt}
        </h3>
        <p className="arabic mt-1 text-orange-800">{current.surah.arabic}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {current.options.map((option) => {
            const isChosen = revealed && chosen === option;
            const isCorrect = revealed && option === current.correctAnswer;
            const base =
              "rounded-2xl px-5 py-4 text-left text-base font-bold shadow-sm ring-2 transition active:scale-[0.98]";
            let style =
              "bg-white text-amber-950 ring-amber-200 hover:bg-amber-50 hover:ring-amber-300";
            if (revealed) {
              if (isCorrect)
                style = "bg-emerald-200 text-emerald-900 ring-emerald-300 pop-in";
              else if (isChosen)
                style = "bg-red-200 text-red-900 ring-red-300 shake";
              else style = "bg-white/70 text-amber-950/60 ring-amber-100";
            }
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => handleChoose(option)}
                className={`${base} ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </article>
      <FeedbackOverlay kind={feedback} onDone={handleFeedbackDone} />
    </div>
  );
}

function KitchenPopup({
  index,
  title,
  status,
  stage,
  onStageComplete,
}: {
  index: number;
  title: string;
  status: string;
  stage: KitchenStage;
  onStageComplete: () => void;
}) {
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus =
      typeof document !== "undefined" ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="pop-in burger-scene-panel flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden p-4 shadow-2xl"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-amber-950/80">
          {title}
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-amber-950 sm:text-2xl">
          {status}
        </h2>
        <div className="burger-kitchen-window mt-3 aspect-[4/3] w-full overflow-hidden bg-amber-50">
          <FoodKitchen
            key={index}
            stage={stage}
            onStageComplete={onStageComplete}
          />
        </div>
      </article>
    </div>
  );
}

function ScoreBar({
  index,
  total,
  score,
  answers,
}: {
  index: number;
  total: number;
  score: number;
  answers: HistoryAnswer[];
}) {
  const strings = useStrings();
  const pct = Math.max(0, Math.min(100, (answers.length / total) * 100));
  return (
    <div className="burger-wood-panel p-3 shadow">
      <div className="flex items-center justify-between text-sm font-bold text-amber-950">
        <span>
          {strings.scoreLabel}:{" "}
          <span className="text-emerald-700">{score}</span> / {total}
        </span>
        <span className="text-orange-800">
          {index + 1} / {total}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden bg-amber-200">
        <div
          className="h-full bg-gradient-to-r from-orange-400 via-yellow-300 to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ChanceRow({
  total,
  answers,
}: {
  total: number;
  answers: HistoryAnswer[];
}) {
  return (
    <ol className="mt-3 flex flex-wrap justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const answer = answers[i];
        const emoji = !answer ? "▫️" : answer.correct ? "🍔" : "🍽️";
        return (
          <li key={i} className="text-lg leading-none">
            {emoji}
          </li>
        );
      })}
    </ol>
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

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "tukang-burger",
      score,
      total,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [score, total, answers, scope]);

  useEffect(() => {
    if (pct >= 70) fireConfetti();
  }, [pct]);

  return (
    <article className="flex flex-col items-center gap-4 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-8 text-center shadow-lg ring-4 ring-orange-200/70">
      <ThemedMascot size={140} mood={mood} className="wobble" />
      <h2 className="text-3xl font-extrabold text-orange-700">
        {strings.burgerFinishTitle}
      </h2>
      <p className="text-xl font-bold text-amber-950">{message}</p>
      <p className="text-5xl font-extrabold tracking-tight text-amber-950">
        <span className="text-emerald-600">{score}</span>
        <span className="text-orange-800">/{total}</span>
      </p>
      <p className="text-base font-bold text-amber-900/80">
        {strings.scoreLabel}: {score}/{total}
      </p>
      <ChanceRow total={total} answers={answers} />
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-orange-500 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-orange-600 active:scale-95"
      >
        🍔 {strings.playAgain}
      </button>
    </article>
  );
}
