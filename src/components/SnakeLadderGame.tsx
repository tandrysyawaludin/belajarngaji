"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import {
  BOARD_JUMPS,
  BOARD_SIZE,
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  getMoveTarget,
  resolveAnsweredMove,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import { isMultiplayer, playerTheme, type Player } from "@/lib/players";
import { useStrings } from "@/components/LocaleProvider";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { TurnBanner } from "./TurnBanner";

type Phase = "ask" | "answering" | "roll" | "rolling" | "moving" | "wrong" | "won";

// Small per-seat offsets so multiple tokens on the same square stay visible.
const TOKEN_OFFSETS = [
  { dx: -8, dy: -7 },
  { dx: 8, dy: -7 },
  { dx: -8, dy: 9 },
  { dx: 8, dy: 9 },
];

const BOARD_COLS = 6;
const BOARD_ROWS = Math.ceil(BOARD_SIZE / BOARD_COLS);
const CELL_UNIT = 20;

// Boustrophedon ("snake") layout: square 1 sits bottom-left, numbering winds
// left-to-right then right-to-left up the board, like a real Snake & Ladder.
function squareCoords(square: number): { col: number; rowFromTop: number } {
  const index = square - 1;
  const row = Math.floor(index / BOARD_COLS);
  const colInRow = index % BOARD_COLS;
  const col = row % 2 === 0 ? colInRow : BOARD_COLS - 1 - colInRow;
  return { col, rowFromTop: BOARD_ROWS - 1 - row };
}

// Render order for a top-to-bottom, left-to-right CSS grid.
const DISPLAY_SQUARES: number[] = [];
for (let rowFromTop = 0; rowFromTop < BOARD_ROWS; rowFromTop += 1) {
  const row = BOARD_ROWS - 1 - rowFromTop;
  for (let col = 0; col < BOARD_COLS; col += 1) {
    const colInRow = row % 2 === 0 ? col : BOARD_COLS - 1 - col;
    DISPLAY_SQUARES.push(row * BOARD_COLS + colInRow + 1);
  }
}

const SQUARE_COLORS = [
  "bg-rose-200",
  "bg-orange-200",
  "bg-amber-200",
  "bg-lime-200",
  "bg-emerald-200",
  "bg-teal-200",
  "bg-sky-200",
  "bg-violet-200",
  "bg-fuchsia-200",
  "bg-cyan-200",
];

function centerPercent(square: number): { x: number; y: number } {
  const { col, rowFromTop } = squareCoords(square);
  return {
    x: ((col + 0.5) / BOARD_COLS) * 100,
    y: ((rowFromTop + 0.5) / BOARD_ROWS) * 100,
  };
}

function centerSvg(square: number): { x: number; y: number } {
  const { col, rowFromTop } = squareCoords(square);
  return {
    x: (col + 0.5) * CELL_UNIT,
    y: (rowFromTop + 0.5) * CELL_UNIT,
  };
}

export function SnakeLadderGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const multi = isMultiplayer(players);
  const [positions, setPositions] = useState<number[]>(() =>
    players.map(() => 1),
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(
    null,
  );
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [dicePop, setDicePop] = useState(false);
  const [lastDice, setLastDice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(
    () => new Set(),
  );
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
    if (rolling) return "Dadu sedang berputar...";
    if (moving) return "Ayam sedang berjalan...";
    if (phase === "roll") return strings.rollNow + "!";
    if (phase === "wrong")
      return multi ? strings.wrongTurnPass : strings.wrongTurnRetry;
    return strings.answerFirstHint;
  }, [moving, multi, phase, rolling]);

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
      setPositions((prev) =>
        prev.map((p, i) => (i === playerIndex ? square : p)),
      );
    }
  };

  const openQuestion = () => {
    if (phase !== "ask") return;
    let nextUsed = usedQuestionKeys;
    let question: SnakeLadderQuestion;
    try {
      question = buildSnakeLadderQuestion(scope, Math.random, usedQuestionKeys);
    } catch {
      // Whole question pool used this session: recycle it so play continues.
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

  const rollDice = async () => {
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
      // Ladder or snake: glide straight to the destination in one motion.
      await wait(320);
      setPositions((prev) =>
        prev.map((p, i) => (i === mover ? move.position : p)),
      );
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
          gameId="ular-tangga"
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
  let actionAccent: string = "bg-pink-500 hover:bg-pink-600";
  if (phase === "ask") {
    actionLabel = strings.snakeAnswerQuestion;
    actionHandler = openQuestion;
    actionAccent = "bg-pink-500 hover:bg-pink-600";
  } else if (phase === "roll") {
    actionLabel = strings.rollNow;
    actionHandler = rollDice;
    actionAccent = "bg-emerald-500 hover:bg-emerald-600";
  } else if (phase === "wrong") {
    actionLabel = multi ? strings.nextPlayer : strings.retry;
    actionHandler = endTurn;
    actionAccent = "bg-emerald-500 hover:bg-emerald-600";
  } else {
    actionLabel = statusText;
    actionHandler = () => {};
    actionAccent = "bg-emerald-500";
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="rounded-[2rem] bg-gradient-to-br from-lime-100 via-emerald-50 to-sky-100 p-4 shadow-lg ring-4 ring-white/70">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-600">
              Papan Ular Tangga
            </p>
            <h2 className="text-2xl font-extrabold text-emerald-900">
              {multi ? `${currentName} di kotak ${position}` : `Kotak ${position} / ${BOARD_SIZE}`}
            </h2>
          </div>
          {!multi && (
            <div className="rounded-2xl bg-white/85 px-4 py-2 text-sm font-extrabold text-emerald-800 shadow ring-2 ring-emerald-100">
              Skor {soloScore} / {answers.length || 0}
            </div>
          )}
        </div>
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/80 ring-2 ring-emerald-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-sky-400 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <Board
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
        <article className="rounded-3xl bg-white/95 p-5 shadow-lg ring-4 ring-emerald-100">
          <div className="flex items-center gap-3">
            <ChickenCharacter size={92} animated={busy} />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-500">
                {multi ? `${strings.turnLabel}: ${currentName}` : strings.snakeYourTurn}
              </p>
              <p
                role="status"
                aria-live="polite"
                className="text-lg font-extrabold text-emerald-900"
              >
                {statusText}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={actionHandler}
            className={`mt-4 w-full rounded-full px-6 py-3 text-lg font-extrabold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300 ${actionAccent}`}
          >
            {actionLabel}
          </button>
          <div className="mt-3 flex min-h-[6rem] items-center justify-center gap-8">
            <DiceCube value={diceValue} rolling={rolling} popping={dicePop} />
            {lastDice !== null && (
              <DiceStatement
                key={`${currentPlayer}-${lastDice}`}
                dice={lastDice}
              />
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

const DICE_DOTS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

// Rotation that brings a given value's face to the front. Faces are fixed
// (front=1, back=6, right=3, left=4, top=2, bottom=5) and the cube rotates.
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
  // Slight base tilt so the resting die still reads as 3D.
  const settled = `rotateX(${-18 + rot.x}deg) rotateY(${-22 + rot.y}deg)`;
  return (
    <div
      className={`dice-scene ${rolling ? "is-rolling" : ""} ${
        popping ? "is-pop" : ""
      }`}
      aria-label={value ? `Dadu menunjukkan ${value}` : "Dadu belum dilempar"}
    >
      <div
        className={`dice3d ${rolling ? "is-rolling" : ""}`}
        style={{ transform: settled }}
      >
        <DiceFace3D face="front" value={1} active={rolling || v === 1} />
        <DiceFace3D face="back" value={6} active={rolling || v === 6} />
        <DiceFace3D face="right" value={3} active={rolling || v === 3} />
        <DiceFace3D face="left" value={4} active={rolling || v === 4} />
        <DiceFace3D face="top" value={2} active={rolling || v === 2} />
        <DiceFace3D face="bottom" value={5} active={rolling || v === 5} />
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
    <div className={`dice3d-face dice3d-face--${face}`}>
      {active &&
        Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={`dice3d-pip ${dots.includes(index + 1) ? "" : "is-off"}`}
          />
        ))}
    </div>
  );
}

function DiceStatement({ dice }: { dice: number }) {
  const words = [`${dice}`, "langkah"];
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-left text-4xl font-extrabold leading-snug text-emerald-800"
    >
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          className="dice-word"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}

function Board({
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
  const jumps = Object.entries(BOARD_JUMPS).map(([from, to]) => ({
    from: Number(from),
    to,
  }));
  const currentSquare = positions[currentIndex];

  return (
    <div className="relative mx-auto aspect-[6/5] w-full overflow-hidden rounded-2xl">
      {/* Layer 1: colored cells */}
      <div className="grid h-full w-full grid-cols-6 grid-rows-5 gap-1">
        {DISPLAY_SQUARES.map((square) => {
          const isTarget = square === currentSquare;
          const color = SQUARE_COLORS[square % SQUARE_COLORS.length];
          return (
            <div
              key={square}
              aria-label={describeSquare(square)}
              className={`rounded-xl ${color} ring-2 ring-white/70 ${
                isTarget ? "outline outline-2 outline-emerald-600" : ""
              }`}
            />
          );
        })}
      </div>

      {/* Layer 2: snakes & ladders */}
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
            <Ladder key={from} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ) : (
            <Snake key={from} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </svg>

      {/* Layer 3: numbers (above snakes/ladders so they stay readable) */}
      <div className="pointer-events-none absolute inset-0 z-20 grid grid-cols-6 grid-rows-5 gap-1">
        {DISPLAY_SQUARES.map((square) => (
          <div key={square} className="relative">
            <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold text-emerald-900 shadow ring-1 ring-emerald-300 sm:h-7 sm:w-7 sm:text-sm">
              {square}
            </span>
            {square === 1 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow">
                Start
              </span>
            )}
            {square === BOARD_SIZE && (
              <span className="absolute bottom-1 left-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow">
                Finish
              </span>
            )}
          </div>
        ))}
      </div>

      <Tokens
        positions={positions}
        players={players}
        currentIndex={currentIndex}
        moving={moving}
      />
    </div>
  );
}

function Ladder({
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
  const offset = 2.6;
  const rungCount = Math.max(2, Math.round(len / 5));
  const rungs: string[] = [];
  for (let i = 1; i < rungCount; i += 1) {
    const t = i / rungCount;
    const cx = x1 + dx * t;
    const cy = y1 + dy * t;
    rungs.push(
      `M ${cx + px * offset} ${cy + py * offset} L ${cx - px * offset} ${cy - py * offset}`,
    );
  }
  return (
    <g strokeLinecap="round">
      <path
        d={`M ${x1 + px * offset} ${y1 + py * offset} L ${x2 + px * offset} ${y2 + py * offset}`}
        stroke="#b45309"
        strokeWidth="1.8"
      />
      <path
        d={`M ${x1 - px * offset} ${y1 - py * offset} L ${x2 - px * offset} ${y2 - py * offset}`}
        stroke="#b45309"
        strokeWidth="1.8"
      />
      {rungs.map((d, index) => (
        <path key={index} d={d} stroke="#f59e0b" strokeWidth="1.3" />
      ))}
    </g>
  );
}

function Snake({
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
  const amp = 6;
  const c1x = x1 + dx * 0.3 + px * amp;
  const c1y = y1 + dy * 0.3 + py * amp;
  const c2x = x1 + dx * 0.7 - px * amp;
  const c2y = y1 + dy * 0.7 - py * amp;
  const path = `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={path} stroke="#047857" strokeWidth="4.2" />
      <path
        d={path}
        stroke="#a7f3d0"
        strokeWidth="1.4"
        strokeDasharray="1.4 3.6"
      />
      <circle cx={x1} cy={y1} r="3.4" fill="#047857" />
      <circle cx={x1 - 1.1} cy={y1 - 1} r="0.7" fill="#ffffff" />
      <circle cx={x1 + 1.1} cy={y1 - 1} r="0.7" fill="#ffffff" />
      <path
        d={`M ${x1} ${y1 + 2.6} L ${x1 - 1.4} ${y1 + 4.6} M ${x1} ${y1 + 2.6} L ${x1 + 1.4} ${y1 + 4.6}`}
        stroke="#ef4444"
        strokeWidth="0.7"
      />
    </g>
  );
}

function Tokens({
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
        const offset = spread
          ? TOKEN_OFFSETS[i % TOKEN_OFFSETS.length]
          : { dx: 0, dy: 0 };
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
              className={`inline-block drop-shadow-md ${
                isActive ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl opacity-80"
              } ${moving && isActive ? "chicken-hop" : ""}`}
            >
              {playerTheme(i).token}
            </span>
          </div>
        );
      })}
    </>
  );
}

function describeSquare(square: number): string {
  const jumpTo = BOARD_JUMPS[square];
  const parts = [`Kotak ${square}`];
  if (jumpTo !== undefined) {
    parts.push(jumpTo > square ? `tangga ke ${jumpTo}` : `ular ke ${jumpTo}`);
  }
  return parts.join(", ");
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
    const focusable = getFocusableElements(dialogRef.current);
    (focusable[0] ?? dialogRef.current)?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(dialogRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snake-ladder-question-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="pop-in max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white/95 p-5 shadow-2xl ring-4 ring-pink-100"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-pink-500">
          {playerName ? `${strings.turnLabel}: ${playerName}` : strings.snakeAnswerFirstShort}
        </p>
        <h3
          id="snake-ladder-question-title"
          className="mt-2 text-xl font-extrabold text-pink-800"
        >
          {question.prompt}
        </h3>
        <p className="arabic mt-1 text-pink-600">{question.surah.arabic}</p>

        <div className="mt-5 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              className="rounded-2xl bg-white px-5 py-4 text-left text-base font-bold text-pink-900 shadow-sm ring-2 ring-pink-100 transition hover:bg-pink-50 hover:ring-pink-200 active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}

function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function ChickenCharacter({
  size,
  animated = false,
}: {
  size: number;
  animated?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-yellow-100 shadow-inner ring-4 ring-yellow-200 ${
        animated ? "chicken-hop" : "wobble"
      }`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: Math.round(size * 0.56) }}>🐔</span>
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
  const pct = total > 0 ? (score / total) * 100 : 0;
  const mood = pct >= 70 ? "excited" : pct >= 40 ? "happy" : "sad";

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "ular-tangga",
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
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-lime-100 via-emerald-100 to-sky-100 p-8 text-center shadow-lg ring-4 ring-white/60">
      <ChickenCharacter size={140} animated={mood === "excited"} />
      <h2 className="text-3xl font-extrabold text-emerald-700">
        {strings.snakeFinishTitle}
      </h2>
      <p className="text-xl font-bold text-emerald-950">
        {strings.scoreLabel}:{" "}
        <span className="text-emerald-600">{score}</span> / {total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-emerald-500 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-600 active:scale-95"
      >
        {strings.playAgain}
      </button>
    </article>
  );
}
