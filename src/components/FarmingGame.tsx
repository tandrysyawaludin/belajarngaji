"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import {
  DISPLAY_SQUARES,
  centerPercent,
} from "@/lib/board-path";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, playerTheme, type Player } from "@/lib/players";
import {
  BOARD_JUMPS,
  BOARD_SIZE,
  buildSnakeLadderQuestion,
  getMoveTarget,
  getSnakeLadderQuestionKey,
  resolveAnsweredMove,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import { useStrings, useFormat } from "@/components/LocaleProvider";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { TurnBanner } from "./TurnBanner";

type Phase = "ask" | "answering" | "act" | "working" | "moving" | "wrong" | "won";
type FarmAction = "water" | "plant" | "harvest";

const FARM_ACTION_STEPS: Record<FarmAction, { min: number; max: number }> = {
  water: { min: 1, max: 3 },
  plant: { min: 2, max: 4 },
  harvest: { min: 1, max: 6 },
};

const FARM_ACTION_EMOJI: Record<FarmAction, string> = {
  water: "💧",
  plant: "🌱",
  harvest: "🌾",
};

const TOKEN_OFFSETS = [
  { dx: -8, dy: -7 },
  { dx: 8, dy: -7 },
  { dx: -8, dy: 9 },
  { dx: 8, dy: 9 },
];

const CROP_TILES = new Set([4, 8, 12, 16, 20, 24, 28]);
const WATER_TILES = new Set(
  Object.entries(BOARD_JUMPS)
    .filter(([from, to]) => to > Number(from))
    .map(([from]) => Number(from)),
);
const HOLE_TILES = new Set(
  Object.entries(BOARD_JUMPS)
    .filter(([from, to]) => to < Number(from))
    .map(([from]) => Number(from)),
);

export function FarmingGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const format = useFormat();
  const multi = isMultiplayer(players);
  const [positions, setPositions] = useState<number[]>(() => players.map(() => 1));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(null);
  const [lastAction, setLastAction] = useState<FarmAction | null>(null);
  const [lastGrowth, setLastGrowth] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(() => new Set());
  const timersRef = useRef<number[]>([]);

  const position = positions[currentPlayer];
  const finished = winner !== null;
  const working = phase === "working";
  const moving = phase === "moving";
  const soloScore = answers.filter((a) => a.correct).length;
  const progressPct = Math.round(((position - 1) / (BOARD_SIZE - 1)) * 100);
  const standings = players.map((p, i) => ({ ...p, score: positions[i] }));
  const currentName = players[currentPlayer]?.name ?? "";

  const statusText = useMemo(() => {
    if (working && lastAction === "water") return strings.farmWorkingWater;
    if (working && lastAction === "plant") return strings.farmWorkingPlant;
    if (working && lastAction === "harvest") return strings.farmWorkingHarvest;
    if (moving) return strings.farmMovingStatus;
    if (phase === "act") return strings.farmChooseAction;
    if (phase === "wrong") return multi ? strings.wrongTurnPass : strings.wrongTurnRetry;
    return strings.farmAnswerFirstHint;
  }, [lastAction, moving, multi, phase, strings, working]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
      timersRef.current = [];
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((item) => item !== timer);
        resolve();
      }, ms);
      timersRef.current.push(timer);
    });

  const animateToken = async (playerIndex: number, from: number, to: number) => {
    if (from === to) return;
    const step = from < to ? 1 : -1;
    for (
      let square = from + step;
      step > 0 ? square <= to : square >= to;
      square += step
    ) {
      await wait(440);
      setPositions((prev) => prev.map((p, i) => (i === playerIndex ? square : p)));
    }
  };

  const openQuestion = () => {
    if (phase !== "ask") return;
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
    setFeedback(correct ? "correct" : "wrong");
    setPhase(correct ? "act" : "wrong");
  };

  const endTurn = () => {
    setPhase("ask");
    setTurnQuestion(null);
    setLastAction(null);
    setLastGrowth(null);
    setFeedback(null);
    setCurrentPlayer((p) => (p + 1) % players.length);
  };

  const doFarmAction = async (action: FarmAction) => {
    if (phase !== "act") return;
    const { min, max } = FARM_ACTION_STEPS[action];
    const steps = min + Math.floor(Math.random() * (max - min + 1));
    setLastAction(action);
    setLastGrowth(steps);
    setPhase("working");
    await wait(900);

    const mover = currentPlayer;
    const from = positions[mover];
    const target = getMoveTarget(from, steps);
    const move = resolveAnsweredMove({
      previousPosition: from,
      targetPosition: target,
      isCorrect: true,
    });

    setPhase("moving");
    await wait(260);
    await animateToken(mover, from, target);
    if (move.jump) {
      await wait(320);
      setPositions((prev) => prev.map((p, i) => (i === mover ? move.position : p)));
      await wait(720);
    }

    if (move.position === BOARD_SIZE) {
      setWinner(mover);
      setPhase("won");
      return;
    }
    endTurn();
  };

  const restart = () => {
    setPositions(players.map(() => 1));
    setCurrentPlayer(0);
    setPhase("ask");
    setTurnQuestion(null);
    setLastAction(null);
    setLastGrowth(null);
    setFeedback(null);
    setAnswers([]);
    setWinner(null);
    setUsedQuestionKeys(new Set());
  };

  if (finished) {
    if (multi) {
      return (
        <MultiplayerResult
          players={standings}
          gameId="berkebun"
          scope={scope}
          total={BOARD_SIZE}
          unit={strings.squaresUnit}
          onRestart={restart}
        />
      );
    }
    return (
      <ResultCard
        score={soloScore}
        total={answers.length}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

  const busy = working || moving;
  const showMainButton = phase === "ask" || phase === "wrong";
  let actionLabel = strings.farmAnswerFirstHint;
  let actionHandler: () => void = openQuestion;
  let actionAccent = "bg-lime-600 hover:bg-lime-700";
  if (phase === "ask") {
    actionLabel = strings.farmAnswerQuestion;
    actionHandler = openQuestion;
  } else if (phase === "wrong") {
    actionLabel = multi ? strings.nextPlayer : strings.retry;
    actionHandler = endTurn;
    actionAccent = "bg-amber-600 hover:bg-amber-700";
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
      <section className="farm-scene-panel rounded-[2rem] p-4 shadow-lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-amber-100 drop-shadow">
              {strings.farmBoardTitle}
            </p>
            <h2 className="text-xl font-extrabold text-white drop-shadow-[1px_1px_0_#3d2817] sm:text-2xl">
              {multi
                ? `${currentName} · ${format(strings.farmProgressText, { current: position, total: BOARD_SIZE })}`
                : format(strings.farmProgressText, { current: position, total: BOARD_SIZE })}
            </h2>
          </div>
          {!multi && (
            <div className="farm-wood-panel rounded-lg px-3 py-2 text-sm font-extrabold text-amber-950">
              {strings.scoreLabel} {soloScore}/{answers.length || 0}
            </div>
          )}
        </div>
        <div className="farm-progress-track mb-3 h-4 overflow-hidden rounded-full">
          <div className="farm-progress-fill h-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <FarmScene
          positions={positions}
          players={players}
          currentIndex={currentPlayer}
          moving={moving}
        />
      </section>

      <aside className="flex flex-col gap-4">
        {multi && (
          <TurnBanner
            players={standings}
            currentIndex={currentPlayer}
            scoreUnit={strings.squaresUnit}
          />
        )}
        <article className="farm-wood-panel rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <FarmerAvatar size={88} animated={busy} />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-amber-900/80">
                {multi ? `${strings.turnLabel}: ${currentName}` : strings.farmYourTurn}
              </p>
              <p role="status" aria-live="polite" className="text-lg font-extrabold text-amber-950">
                {statusText}
              </p>
            </div>
          </div>
          {showMainButton ? (
            <button
              type="button"
              disabled={busy}
              onClick={actionHandler}
              className={`mt-4 w-full rounded-xl px-5 py-4 text-base font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60 ${actionAccent}`}
            >
              {actionLabel}
            </button>
          ) : phase === "act" ? (
            <div className="mt-4">
              <p className="mb-2 text-center text-xs font-extrabold uppercase tracking-wide text-amber-900/70">
                {strings.farmChooseAction}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["water", strings.farmWaterAction, "💧"],
                    ["plant", strings.farmPlantAction, "🌱"],
                    ["harvest", strings.farmHarvestAction, "🌾"],
                  ] as const
                ).map(([action, label, icon]) => (
                  <button
                    key={action}
                    type="button"
                    disabled={busy}
                    onClick={() => doFarmAction(action)}
                    title={label}
                    className="farm-hotbar-slot flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-center transition active:scale-95 disabled:opacity-60"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-[10px] font-extrabold leading-tight text-amber-950 sm:text-xs">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-3 flex min-h-[4.5rem] flex-col items-center justify-center gap-2">
            {working && lastAction && (
              <p className="farm-action-pulse text-5xl" aria-hidden="true">
                {FARM_ACTION_EMOJI[lastAction]}
              </p>
            )}
            {lastGrowth !== null && lastAction && (working || moving) && (
              <p className="text-center text-base font-extrabold text-amber-950">
                {FARM_ACTION_EMOJI[lastAction]}{" "}
                {format(strings.farmGrowthResult, { n: lastGrowth })}
              </p>
            )}
          </div>
        </article>
      </aside>

      {phase === "answering" && turnQuestion && (
        <QuestionModal
          question={turnQuestion}
          playerName={multi ? currentName : null}
          onChoose={chooseAnswer}
        />
      )}
      <FeedbackOverlay kind={feedback} onDone={() => setFeedback(null)} />
    </div>
  );
}

function FarmScene({
  positions,
  players,
  currentIndex,
  moving,
}: {
  positions: number[];
  players: Player[];
  currentIndex: number;
  moving: boolean;
}) {
  const strings = useStrings();
  const currentSquare = positions[currentIndex];
  const maxReached = Math.max(...positions);

  return (
    <div className="farm-field relative mx-auto aspect-[6/5] w-full overflow-hidden rounded-xl p-2">
      <span className="pointer-events-none absolute left-1 top-1 text-lg opacity-80" aria-hidden="true">
        🌳
      </span>
      <span className="pointer-events-none absolute right-1 top-1 text-lg opacity-80" aria-hidden="true">
        🌲
      </span>
      <span className="pointer-events-none absolute bottom-1 left-1 text-lg opacity-80" aria-hidden="true">
        🪵
      </span>
      <span className="pointer-events-none absolute bottom-1 right-1 text-lg opacity-80" aria-hidden="true">
        🌻
      </span>

      <div className="grid h-full w-full grid-cols-6 grid-rows-5 gap-0.5">
        {DISPLAY_SQUARES.map((square) => {
          const isActive = square === currentSquare;
          const passed = square < maxReached;
          const jumpTo = BOARD_JUMPS[square];
          const variant =
            square === BOARD_SIZE
              ? "silo"
              : square === 1
                ? "barn"
                : WATER_TILES.has(square)
                  ? "water"
                  : HOLE_TILES.has(square)
                    ? "hole"
                    : CROP_TILES.has(square) || passed
                      ? "crop"
                      : "soil";
          return (
            <FarmTile
              key={square}
              square={square}
              variant={variant}
              active={isActive}
              passed={passed && variant === "soil"}
              jumpTo={jumpTo}
              label={
                square === 1
                  ? strings.farmStartLabel
                  : square === BOARD_SIZE
                    ? strings.farmFinishLabel
                    : undefined
              }
            />
          );
        })}
      </div>

      <FarmTokens
        positions={positions}
        players={players}
        currentIndex={currentIndex}
        moving={moving}
      />
    </div>
  );
}

function FarmTile({
  square,
  variant,
  active,
  passed,
  jumpTo,
  label,
}: {
  square: number;
  variant: "soil" | "crop" | "water" | "hole" | "barn" | "silo";
  active: boolean;
  passed?: boolean;
  jumpTo?: number;
  label?: string;
}) {
  const tileClass =
    variant === "barn"
      ? "farm-tile--barn"
      : variant === "silo"
        ? "farm-tile--silo"
        : variant === "water"
          ? "farm-tile--water"
          : variant === "hole"
            ? "farm-tile--hole"
            : variant === "crop"
              ? "farm-tile--crop"
              : passed
                ? "farm-tile--soil-done"
                : "farm-tile--soil";

  const decor =
    variant === "barn"
      ? "🏠"
      : variant === "silo"
        ? "🏆"
        : variant === "water"
          ? "⛲"
          : variant === "hole"
            ? "🐀"
            : variant === "crop"
              ? passed
                ? "🌾"
                : "🌱"
              : passed
                ? "🥕"
                : null;

  const jumpHint =
    jumpTo !== undefined
      ? jumpTo > square
        ? "⬆️"
        : "⬇️"
      : null;

  return (
    <div
      className={`farm-tile ${tileClass} ${active ? "farm-tile--active" : ""}`}
      aria-label={label ?? `Plot ${square}`}
    >
      {decor && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base sm:text-lg" aria-hidden="true">
          {decor}
        </span>
      )}
      {jumpHint && (
        <span className="absolute right-0.5 top-0.5 text-[10px] sm:text-xs" aria-hidden="true">
          {jumpHint}
        </span>
      )}
      {label && (
        <span className="absolute bottom-0 left-0 right-0 bg-black/55 py-0.5 text-center text-[8px] font-extrabold uppercase text-white sm:text-[9px]">
          {label}
        </span>
      )}
    </div>
  );
}

function FarmTokens({
  positions,
  players,
  currentIndex,
  moving,
}: {
  positions: number[];
  players: Player[];
  currentIndex: number;
  moving: boolean;
}) {
  const spread = players.length > 1;
  return (
    <>
      {players.map((player, i) => {
        const { x, y } = centerPercent(positions[i]);
        const offset = spread ? TOKEN_OFFSETS[i % TOKEN_OFFSETS.length] : { dx: 0, dy: 0 };
        const isActive = i === currentIndex;
        return (
          <div
            key={player.id}
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              marginLeft: offset.dx,
              marginTop: offset.dy,
            }}
          >
            <span
              className={`farm-player inline-block ${
                isActive ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl opacity-90"
              } ${moving && isActive ? "chicken-hop" : ""}`}
            >
              {isActive ? "🧑‍🌾" : playerTheme(i).token}
            </span>
          </div>
        );
      })}
    </>
  );
}

function FarmerAvatar({ size, animated = false }: { size: number; animated?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xl border-2 border-amber-900/40 bg-amber-100/80 shadow-inner ${
        animated ? "chicken-hop" : "wobble"
      }`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: Math.round(size * 0.48) }}>🧑‍🌾</span>
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
    (dialogRef.current)?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="pop-in farm-wood-panel max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-5"
      >
        <p className="font-mono text-sm font-extrabold uppercase tracking-wide text-lime-700">
          {playerName ? `${strings.turnLabel}: ${playerName}` : strings.farmAnswerFirstShort}
        </p>
        <h3 className="mt-2 text-xl font-extrabold text-stone-900">{question.prompt}</h3>
        <p className="arabic mt-1 text-lime-800">{question.surah.arabic}</p>
        <div className="mt-5 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              className="rounded-xl bg-white/90 px-5 py-4 text-left text-base font-bold text-amber-950 shadow-sm ring-2 ring-amber-200/80 transition hover:bg-white active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>
      </article>
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
  const strings = useStrings();
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "berkebun",
      score,
      total,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [score, total, answers, scope]);

  useEffect(() => {
    import("./Feedback").then(({ fireConfetti }) => fireConfetti());
  }, []);

  return (
    <article className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-lime-200 via-amber-100 to-sky-200 p-8 text-center shadow-lg ring-4 ring-amber-200/60">
      <FarmerAvatar size={140} animated />
      <h2 className="font-mono text-3xl font-extrabold text-lime-900 drop-shadow-[2px_2px_0_#fff]">
        {strings.farmFinishTitle}
      </h2>
      <p className="text-xl font-bold text-stone-900">
        {strings.scoreLabel}: <span className="text-emerald-700">{score}</span> / {total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-xl bg-lime-600 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-lime-700 active:scale-95"
      >
        🌾 {strings.playAgain}
      </button>
    </article>
  );
}
