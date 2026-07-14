"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import {
  BOARD_COLS,
  BOARD_ROWS,
  CELL_UNIT,
  DISPLAY_SQUARES,
  centerPercent,
  centerSvg,
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
import { useStrings } from "@/components/LocaleProvider";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { TurnBanner } from "./TurnBanner";

type Phase = "ask" | "answering" | "roll" | "rolling" | "moving" | "wrong" | "won";

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
  const multi = isMultiplayer(players);
  const [positions, setPositions] = useState<number[]>(() => players.map(() => 1));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [dicePop, setDicePop] = useState(false);
  const [lastDice, setLastDice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(() => new Set());
  const timersRef = useRef<number[]>([]);

  const position = positions[currentPlayer];
  const finished = winner !== null;
  const rolling = phase === "rolling";
  const moving = phase === "moving";
  const soloScore = answers.filter((a) => a.correct).length;
  const progressPct = Math.round(((position - 1) / (BOARD_SIZE - 1)) * 100);
  const standings = players.map((p, i) => ({ ...p, score: positions[i] }));
  const currentName = players[currentPlayer]?.name ?? "";

  const statusText = useMemo(() => {
    if (rolling) return strings.farmRollingStatus;
    if (moving) return strings.farmMovingStatus;
    if (phase === "roll") return `${strings.farmPlantAction}!`;
    if (phase === "wrong") return multi ? strings.wrongTurnPass : strings.wrongTurnRetry;
    return strings.answerFirstHint;
  }, [moving, multi, phase, rolling, strings]);

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
    setPhase(correct ? "roll" : "wrong");
  };

  const endTurn = () => {
    setPhase("ask");
    setTurnQuestion(null);
    setDiceValue(null);
    setLastDice(null);
    setFeedback(null);
    setCurrentPlayer((p) => (p + 1) % players.length);
  };

  const plantSeeds = async () => {
    if (phase !== "roll") return;
    const dice = Math.floor(Math.random() * 6) + 1;
    setPhase("rolling");
    for (let i = 0; i < 16; i += 1) {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      await wait(110);
    }
    setDiceValue(dice);
    setLastDice(dice);
    setDicePop(true);
    const popTimer = window.setTimeout(() => setDicePop(false), 480);
    timersRef.current.push(popTimer);
    await wait(320);

    const mover = currentPlayer;
    const from = positions[mover];
    const target = getMoveTarget(from, dice);
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
    setDiceValue(null);
    setDicePop(false);
    setLastDice(null);
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

  const busy = rolling || moving;
  let actionLabel: string = strings.answerFirstHint;
  let actionHandler: () => void = openQuestion;
  let actionAccent = "bg-lime-600 hover:bg-lime-700";
  if (phase === "ask") {
    actionLabel = strings.farmAnswerQuestion;
    actionHandler = openQuestion;
  } else if (phase === "roll") {
    actionLabel = strings.farmPlantAction;
    actionHandler = plantSeeds;
    actionAccent = "bg-emerald-600 hover:bg-emerald-700";
  } else if (phase === "wrong") {
    actionLabel = multi ? strings.nextPlayer : strings.retry;
    actionHandler = endTurn;
    actionAccent = "bg-amber-600 hover:bg-amber-700";
  } else {
    actionLabel = statusText;
    actionHandler = () => {};
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="farm-sky rounded-[2rem] p-4 shadow-lg ring-4 ring-white/70">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-lime-200">
              {strings.farmBoardTitle}
            </p>
            <h2 className="font-mono text-2xl font-extrabold text-white drop-shadow-[2px_2px_0_#000]">
              {multi
                ? `${currentName} · ${strings.farmPlotLabel} ${position}`
                : `${strings.farmPlotLabel} ${position} / ${BOARD_SIZE}`}
            </h2>
          </div>
          {!multi && (
            <div className="mc-badge rounded-none px-3 py-2 text-sm font-extrabold text-lime-950">
              {strings.scoreLabel} {soloScore} / {answers.length || 0}
            </div>
          )}
        </div>
        <div className="mb-4 h-3 overflow-hidden border-2 border-black bg-stone-800">
          <div
            className="h-full bg-lime-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <FarmBoard
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
        <article className="rounded-none border-4 border-black bg-stone-200 p-5 shadow-[6px_6px_0_#000]">
          <div className="flex items-center gap-3">
            <FarmerAvatar size={92} animated={busy} />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-lime-700">
                {multi ? `${strings.turnLabel}: ${currentName}` : strings.farmYourTurn}
              </p>
              <p role="status" aria-live="polite" className="text-lg font-extrabold text-stone-900">
                {statusText}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy || phase === "answering"}
            onClick={actionHandler}
            className={`mt-4 w-full border-4 border-black px-5 py-4 text-base font-extrabold text-white shadow-[4px_4px_0_#000] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 ${actionAccent}`}
          >
            {actionLabel}
          </button>
          <div className="mt-3 flex min-h-[6rem] items-center justify-center gap-8">
            {lastDice !== null && !rolling && <DiceCube value={lastDice} rolling={false} popping={dicePop} />}
            {rolling && <DiceCube value={diceValue} rolling />}
            {lastDice !== null && !rolling && (
              <p className="font-mono text-3xl font-extrabold text-stone-800">
                {lastDice} {strings.farmStepsUnit}
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

function FarmBoard({
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
  const jumps = Object.entries(BOARD_JUMPS).map(([from, to]) => ({
    from: Number(from),
    to,
  }));
  const currentSquare = positions[currentIndex];

  return (
    <div className="relative mx-auto aspect-[6/5] w-full overflow-hidden border-4 border-black bg-sky-300">
      <div className="grid h-full w-full grid-cols-6 grid-rows-5 gap-0.5 p-0.5">
        {DISPLAY_SQUARES.map((square) => {
          const isTarget = square === currentSquare;
          const variant = square === BOARD_SIZE
            ? "goal"
            : square === 1
              ? "start"
              : WATER_TILES.has(square)
                ? "water"
                : HOLE_TILES.has(square)
                  ? "hole"
                  : CROP_TILES.has(square)
                    ? "wheat"
                    : "grass";
          return (
            <McBlock
              key={square}
              square={square}
              variant={variant}
              active={isTarget}
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

      <svg
        viewBox={`0 0 ${BOARD_COLS * CELL_UNIT} ${BOARD_ROWS * CELL_UNIT}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        {jumps.map(({ from, to }) => {
          const a = centerSvg(from);
          const b = centerSvg(to);
          return to > from ? (
            <WaterChannel key={from} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ) : (
            <MoleTunnel key={from} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </svg>

      <FarmTokens
        positions={positions}
        players={players}
        currentIndex={currentIndex}
        moving={moving}
      />
    </div>
  );
}

function McBlock({
  square,
  variant,
  active,
  label,
}: {
  square: number;
  variant: "grass" | "wheat" | "water" | "hole" | "start" | "goal";
  active: boolean;
  label?: string;
}) {
  const top =
    variant === "water"
      ? "#3b82f6"
      : variant === "hole"
        ? "#44403c"
        : variant === "wheat"
          ? "#84cc16"
          : variant === "goal"
            ? "#fbbf24"
            : "#5d9e3a";
  const side = variant === "water" ? "#1d4ed8" : variant === "hole" ? "#292524" : "#6d4c11";

  return (
    <div
      className={`relative ${active ? "z-20 ring-2 ring-yellow-300 ring-offset-1 ring-offset-black" : ""}`}
      aria-label={`${square}`}
    >
      <div
        className="mc-block h-full min-h-[2.5rem] w-full"
        style={{
          background: `linear-gradient(180deg, ${top} 0%, ${top} 62%, ${side} 62%, ${side} 100%)`,
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.2)",
        }}
      >
        <span className="absolute right-0.5 top-0.5 font-mono text-[10px] font-bold text-black/70 sm:text-xs">
          {square}
        </span>
        {variant === "wheat" && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-sm sm:text-base" aria-hidden="true">
            🌾
          </span>
        )}
        {variant === "water" && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-sm" aria-hidden="true">
            💧
          </span>
        )}
        {variant === "hole" && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-sm" aria-hidden="true">
            🕳️
          </span>
        )}
        {label && (
          <span className="absolute bottom-0.5 left-0.5 bg-black/75 px-1 font-mono text-[8px] font-bold uppercase text-white sm:text-[10px]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

function WaterChannel({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const offset = 2.2;
  return (
    <g strokeLinecap="round">
      <path
        d={`M ${x1 + px * offset} ${y1 + py * offset} L ${x2 + px * offset} ${y2 + py * offset}`}
        stroke="#1e40af"
        strokeWidth="2.4"
        strokeDasharray="3 2"
      />
      <path
        d={`M ${x1 - px * offset} ${y1 - py * offset} L ${x2 - px * offset} ${y2 - py * offset}`}
        stroke="#60a5fa"
        strokeWidth="2"
      />
    </g>
  );
}

function MoleTunnel({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const amp = 5;
  const c1x = x1 + dx * 0.3 + amp;
  const c1y = y1 + dy * 0.3;
  const c2x = x1 + dx * 0.7 - amp;
  const c2y = y1 + dy * 0.7;
  const path = `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={path} stroke="#292524" strokeWidth="4" />
      <path d={path} stroke="#78716c" strokeWidth="1.5" strokeDasharray="2 3" />
    </g>
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
              className={`inline-block drop-shadow-[2px_2px_0_#000] ${
                isActive ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl opacity-85"
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

const DICE_DOTS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: -180 },
};

function DiceCube({
  value,
  rolling,
  popping = false,
}: {
  value: number | null;
  rolling: boolean;
  popping?: boolean;
}) {
  const v = value ?? 1;
  const rot = FACE_ROTATION[v];
  const settled = `rotateX(${-18 + rot.x}deg) rotateY(${-22 + rot.y}deg)`;
  return (
    <div className={`dice-scene ${rolling ? "is-rolling" : ""} ${popping ? "is-pop" : ""}`}>
      <div className={`dice3d farm-dice ${rolling ? "is-rolling" : ""}`} style={{ transform: settled }}>
        {(["front", "back", "right", "left", "top", "bottom"] as const).map((face, i) => {
          const faceValue = [1, 6, 3, 4, 2, 5][i];
          return (
            <DiceFace3D
              key={face}
              face={face}
              value={faceValue}
              active={rolling || v === faceValue}
            />
          );
        })}
      </div>
    </div>
  );
}

function DiceFace3D({
  face,
  value,
  active,
}: {
  face: string;
  value: number;
  active: boolean;
}) {
  const dots = DICE_DOTS[value] ?? [5];
  return (
    <div className={`dice3d-face dice3d-face--${face} farm-dice-face`}>
      {active &&
        Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={`dice3d-pip ${dots.includes(index + 1) ? "farm-dice-pip" : "is-off"}`}
          />
        ))}
    </div>
  );
}

function FarmerAvatar({ size, animated = false }: { size: number; animated?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center border-4 border-black bg-lime-400 shadow-[4px_4px_0_#000] ${
        animated ? "chicken-hop" : "wobble"
      }`}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    >
      <span style={{ fontSize: Math.round(size * 0.5) }}>🧑‍🌾</span>
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="pop-in max-h-[90vh] w-full max-w-xl overflow-y-auto border-4 border-black bg-stone-100 p-5 shadow-[8px_8px_0_#000]"
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
              className="border-4 border-black bg-white px-5 py-4 text-left text-base font-bold text-stone-900 shadow-[3px_3px_0_#000] transition hover:bg-lime-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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
    <article className="flex flex-col items-center gap-4 border-4 border-black bg-gradient-to-br from-lime-200 via-emerald-200 to-sky-200 p-8 text-center shadow-[8px_8px_0_#000]">
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
        className="border-4 border-black bg-lime-500 px-7 py-3 text-base font-extrabold text-white shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        🌾 {strings.playAgain}
      </button>
    </article>
  );
}
