"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import { useFormat, useStrings } from "@/components/LocaleProvider";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, type Player } from "@/lib/players";
import {
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import {
  createTreasureBoard,
  DIAMOND_COUNT,
  TREASURE_COUNT,
  type ChestLoot,
} from "@/lib/treasure-board";
import { FeedbackOverlay, fireConfetti, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { ThemedMascot } from "./ThemedMascot";
import { TurnBanner } from "./TurnBanner";

const LottieOnce = dynamic(
  () => import("./LottieOnce").then((mod) => mod.LottieOnce),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-violet-300" aria-hidden="true">
        ···
      </div>
    ),
  },
);

const LottieLoop = dynamic(
  () => import("./LottieOnce").then((mod) => mod.LottieLoop),
  { ssr: false, loading: () => null },
);

type Phase = "ask" | "answering" | "pick" | "opening" | "wrong" | "won";

const LOTTIE = {
  lucky: "/animations/treasure-lucky.lottie",
  empty: "/animations/treasure-empty.lottie",
  light: "/animations/square-light.json",
} as const;

export function KotakRahasiaGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const format = useFormat();
  const multi = isMultiplayer(players);
  const [loot, setLoot] = useState<ChestLoot[]>(() => createTreasureBoard());
  const [opened, setOpened] = useState<boolean[]>(() =>
    Array.from({ length: TREASURE_COUNT }, () => false),
  );
  const [diamonds, setDiamonds] = useState<number[]>(() =>
    players.map(() => 0),
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(
    null,
  );
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const openedCount = opened.filter(Boolean).length;
  const finished = phase === "won" || openedCount >= TREASURE_COUNT;
  const canPick = phase === "pick";
  const currentName = players[currentPlayer]?.name ?? "";
  const standings = players.map((player, i) => ({
    ...player,
    score: diamonds[i] ?? 0,
  }));
  const soloDiamonds = diamonds[0] ?? 0;
  const pickedLoot = pickedIndex === null ? null : loot[pickedIndex];

  const openQuestion = () => {
    if (phase !== "ask" && phase !== "wrong") return;
    let nextUsed = usedQuestionKeys;
    let question: SnakeLadderQuestion;
    try {
      question = buildSnakeLadderQuestion(scope, Math.random, usedQuestionKeys);
    } catch {
      nextUsed = new Set();
      question = buildSnakeLadderQuestion(scope, Math.random, nextUsed);
    }
    const used = new Set(nextUsed);
    used.add(getSnakeLadderQuestionKey(question));
    setUsedQuestionKeys(used);
    setTurnQuestion(question);
    setPhase("answering");
    setFeedback(null);
  };

  const chooseAnswer = (option: string) => {
    if (!turnQuestion || phase !== "answering") return;
    const correct = option === turnQuestion.correctAnswer;
    setAnswers((prev) => [
      ...prev,
      {
        prompt: turnQuestion.prompt,
        yourAnswer: option,
        correctAnswer: turnQuestion.correctAnswer,
        correct,
      },
    ]);
    setTurnQuestion(null);
    if (correct) {
      setPhase("pick");
      return;
    }
    setFeedback("wrong");
    setPhase("wrong");
  };

  const pickChest = (index: number) => {
    if (!canPick || opened[index]) return;
    setPickedIndex(index);
    setPhase("opening");
  };

  const finishReveal = () => {
    if (pickedIndex === null || !pickedLoot) return;
    const nextOpened = opened.map((isOpen, i) =>
      i === pickedIndex ? true : isOpen,
    );
    const nextDiamonds =
      pickedLoot === "diamond"
        ? diamonds.map((n, i) => (i === currentPlayer ? n + 1 : n))
        : diamonds;
    setOpened(nextOpened);
    setDiamonds(nextDiamonds);
    setPickedIndex(null);

    const allOpened = nextOpened.every(Boolean);
    if (allOpened) {
      setPhase("won");
      return;
    }
    setPhase("ask");
    setCurrentPlayer((p) => (p + 1) % players.length);
  };

  const playerCount = players.length;
  const afterWrong = useCallback(() => {
    setFeedback(null);
    setPhase("ask");
    if (multi) setCurrentPlayer((p) => (p + 1) % playerCount);
  }, [multi, playerCount]);

  const restart = () => {
    setLoot(createTreasureBoard());
    setOpened(Array.from({ length: TREASURE_COUNT }, () => false));
    setDiamonds(players.map(() => 0));
    setCurrentPlayer(0);
    setPhase("ask");
    setTurnQuestion(null);
    setPickedIndex(null);
    setFeedback(null);
    setAnswers([]);
    setUsedQuestionKeys(new Set());
  };

  if (finished) {
    if (multi) {
      return (
        <MultiplayerResult
          players={standings}
          gameId="kotak-rahasia"
          scope={scope}
          total={DIAMOND_COUNT}
          unit={strings.kotakDiamondsUnit}
          onRestart={restart}
        />
      );
    }
    return (
      <ResultCard
        diamonds={soloDiamonds}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

  const statusText =
    phase === "pick"
      ? strings.kotakChooseBox
      : phase === "opening"
        ? strings.kotakOpeningHint
        : strings.kotakAnswerFirstHint;

  return (
    <div className="flex flex-col gap-4">
      {multi ? (
        <TurnBanner
          players={standings}
          currentIndex={currentPlayer}
          scoreUnit={strings.kotakDiamondsUnit}
        />
      ) : (
        <div className="treasure-wood-panel p-3 shadow">
          <div className="flex items-center justify-between text-sm font-extrabold text-violet-800">
            <span>
              {format(strings.kotakDiamondScore, { current: soloDiamonds })}
            </span>
            <span>
              {strings.scoreLabel} {openedCount}/{TREASURE_COUNT}
            </span>
          </div>
        </div>
      )}

      <section className="treasure-scene-panel overflow-hidden p-4 shadow-lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-violet-500">
              {strings.kotakBoardTitle}
            </p>
            <h2 className="text-xl font-extrabold text-violet-900 sm:text-2xl">
              {multi ? `${currentName} · ${statusText}` : statusText}
            </h2>
          </div>
        </div>
        <div className="treasure-board mx-auto grid aspect-square w-full max-w-md grid-cols-3 grid-rows-3 gap-2 p-2">
          {loot.map((chest, index) => {
            const isOpen = opened[index];
            const isPicked = pickedIndex === index;
            return (
              <button
                key={index}
                type="button"
                disabled={!canPick || isOpen}
                onClick={() => pickChest(index)}
                className={`treasure-chest ${canPick && !isOpen ? "treasure-chest--ready" : ""} ${
                  isOpen ? "treasure-chest--open" : ""
                } ${isOpen && chest === "diamond" ? "treasure-chest--diamond" : ""} ${
                  isOpen && chest === "empty" ? "treasure-chest--empty" : ""
                } ${isPicked ? "treasure-chest--picked" : ""}`}
                aria-label={
                  isOpen
                    ? chest === "diamond"
                      ? strings.kotakDiamondHint
                      : strings.kotakEmptyHint
                    : format(strings.kotakBoxLabel, { n: index + 1 })
                }
              >
                {canPick && !isOpen ? (
                  <span className="treasure-chest-light" aria-hidden="true">
                    <LottieLoop src={LOTTIE.light} />
                  </span>
                ) : null}
                <span className="treasure-chest-label">
                  {isOpen && chest === "diamond" ? (
                    <span className="treasure-chest-gem" aria-hidden="true">
                      💎
                    </span>
                  ) : (
                    index + 1
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {(phase === "ask" || phase === "wrong") && (
        <button
          type="button"
          onClick={openQuestion}
          className="w-full rounded-full bg-fuchsia-400 px-6 py-3 text-lg font-extrabold text-white shadow-md transition hover:bg-fuchsia-500 active:scale-95"
        >
          {phase === "wrong" ? strings.kotakTryAgain : strings.kotakAnswerQuestion}
        </button>
      )}

      {phase === "answering" && turnQuestion && (
        <QuestionModal
          question={turnQuestion}
          playerName={multi ? currentName : null}
          onChoose={chooseAnswer}
        />
      )}

      {phase === "opening" && pickedLoot && (
        <RevealPopup
          title={strings.kotakBoardTitle}
          status={
            pickedLoot === "diamond"
              ? strings.kotakDiamondHint
              : strings.kotakEmptyHint
          }
          loot={pickedLoot}
          onComplete={finishReveal}
        />
      )}

      <FeedbackOverlay kind={feedback} onDone={afterWrong} />
    </div>
  );
}

function QuestionModal({
  question,
  playerName,
  onChoose,
}: {
  question: SnakeLadderQuestion;
  playerName: string | null;
  onChoose: (option: string) => void;
}) {
  const strings = useStrings();
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousFocus =
      typeof document !== "undefined" ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-violet-950/40 p-4 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="pop-in treasure-wood-panel max-h-[90vh] w-full max-w-xl overflow-y-auto p-5"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-violet-800">
          {playerName
            ? `${strings.turnLabel}: ${playerName}`
            : strings.kotakAnswerFirstShort}
        </p>
        <h3 className="mt-2 text-xl font-extrabold text-violet-950">
          {question.prompt}
        </h3>
        <p className="arabic mt-1 text-violet-700">{question.surah.arabic}</p>
        <div className="mt-5 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              className="rounded-xl bg-white/90 px-5 py-4 text-left text-base font-bold text-violet-950 shadow-sm ring-2 ring-violet-200 transition hover:bg-white active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}

function RevealPopup({
  title,
  status,
  loot,
  onComplete,
}: {
  title: string;
  status: string;
  loot: ChestLoot;
  onComplete: () => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/25 p-3 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="pop-in treasure-scene-panel flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden p-4 shadow-2xl"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-violet-500">
          {title}
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-violet-900 sm:text-2xl">
          {status}
        </h2>
        <div className="treasure-window mt-3 aspect-square w-full overflow-hidden">
          <LottieOnce
            src={loot === "diamond" ? LOTTIE.lucky : LOTTIE.empty}
            onComplete={onComplete}
          />
        </div>
      </article>
    </div>
  );
}

function ResultCard({
  diamonds,
  answers,
  scope,
  onRestart,
}: {
  diamonds: number;
  answers: HistoryAnswer[];
  scope: Surah[];
  onRestart: () => void;
}) {
  const strings = useStrings();
  const format = useFormat();
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "kotak-rahasia",
      score: diamonds,
      total: DIAMOND_COUNT,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [diamonds, answers, scope]);

  useEffect(() => {
    if (diamonds > 0) fireConfetti();
  }, [diamonds]);

  return (
    <article className="flex flex-col items-center gap-4 bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 p-8 text-center shadow-lg ring-4 ring-violet-200/70">
      <ThemedMascot
        size={140}
        mood={diamonds >= 3 ? "excited" : diamonds >= 1 ? "happy" : "sad"}
        className="wobble"
      />
      <h2 className="text-3xl font-extrabold text-violet-800">
        {strings.kotakFinishTitle}
      </h2>
      <p className="text-5xl font-extrabold tracking-tight text-violet-950">
        <span className="text-sky-600">{diamonds}</span>
        <span className="text-violet-800">/{DIAMOND_COUNT}</span>
      </p>
      <p className="text-base font-bold text-violet-800/80">
        {format(strings.kotakDiamondScore, { current: diamonds })}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-violet-600 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-violet-700 active:scale-95"
      >
        💎 {strings.playAgain}
      </button>
    </article>
  );
}
