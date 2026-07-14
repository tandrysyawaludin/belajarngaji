"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import {
  CARROT_GOAL,
  FARM_ACTIONS,
  GRID_SIZE,
  applyAction,
  canDoAction,
  createFarm,
  indexToPos,
  type FarmAction,
  type FarmCell,
} from "@/lib/farm-grid";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, playerTheme, type Player } from "@/lib/players";
import {
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import { useStrings, useFormat } from "@/components/LocaleProvider";
import { FeedbackOverlay, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { TurnBanner } from "./TurnBanner";

type Phase = "ask" | "answering" | "play" | "wrong" | "won";

const CENTER_INDEX = Math.floor((GRID_SIZE * GRID_SIZE) / 2);
const TOKEN_OFFSETS = [
  { dx: -10, dy: -8 },
  { dx: 10, dy: -8 },
  { dx: -10, dy: 10 },
  { dx: 10, dy: 10 },
];

const ACTION_ICON: Record<FarmAction, string> = {
  kill: "🐀",
  seed: "🌱",
  water: "💧",
  harvest: "🥕",
  tree: "🌳",
};

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
  const [cells, setCells] = useState<FarmCell[]>(() => createFarm());
  const [positions, setPositions] = useState<number[]>(() =>
    players.map(() => CENTER_INDEX),
  );
  const [carrots, setCarrots] = useState<number[]>(() => players.map(() => 0));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(null);
  const [movedThisTurn, setMovedThisTurn] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(() => new Set());

  const position = positions[currentPlayer];
  const cell = cells[position];
  const finished = winner !== null;
  const playing = phase === "play";
  const soloCarrots = carrots[0] ?? 0;
  const currentName = players[currentPlayer]?.name ?? "";
  const standings = players.map((p, i) => ({ ...p, score: carrots[i] }));

  const availableActions = useMemo(
    () => FARM_ACTIONS.filter((action) => canDoAction(cell, action)),
    [cell],
  );

  const actionLabels: Record<FarmAction, string> = {
    kill: strings.farmActionKill,
    seed: strings.farmActionSeed,
    water: strings.farmActionWater,
    harvest: strings.farmActionHarvest,
    tree: strings.farmActionTree,
  };

  const statusText = useMemo(() => {
    if (playing && !movedThisTurn) return strings.farmTapPlotHint;
    if (playing && movedThisTurn) return strings.farmChooseAction;
    if (phase === "wrong") return multi ? strings.wrongTurnPass : strings.wrongTurnRetry;
    return strings.farmAnswerFirstHint;
  }, [movedThisTurn, multi, phase, playing, strings]);

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
    if (correct) {
      setMovedThisTurn(false);
      setPhase("play");
    } else {
      setPhase("wrong");
    }
  };

  const endTurn = () => {
    setPhase("ask");
    setTurnQuestion(null);
    setMovedThisTurn(false);
    setFeedback(null);
    setCurrentPlayer((p) => (p + 1) % players.length);
  };

  const moveTo = (index: number) => {
    if (phase !== "play") return;
    setPositions((prev) => prev.map((p, i) => (i === currentPlayer ? index : p)));
    setMovedThisTurn(true);
  };

  const doAction = (action: FarmAction) => {
    if (phase !== "play" || !movedThisTurn) return;
    const plot = cells[position];
    if (!canDoAction(plot, action)) return;

    const result = applyAction(plot, action);
    setCells((prev) => prev.map((c, i) => (i === position ? result.cell : c)));

    if (result.carrot) {
      const nextCarrots = carrots.map((n, i) =>
        i === currentPlayer ? n + 1 : n,
      );
      setCarrots(nextCarrots);
      if (nextCarrots[currentPlayer] >= CARROT_GOAL) {
        setWinner(currentPlayer);
        setPhase("won");
        return;
      }
    }
    endTurn();
  };

  const skipAction = () => {
    if (phase !== "play" || !movedThisTurn) return;
    endTurn();
  };

  const restart = () => {
    setCells(createFarm());
    setPositions(players.map(() => CENTER_INDEX));
    setCarrots(players.map(() => 0));
    setCurrentPlayer(0);
    setPhase("ask");
    setTurnQuestion(null);
    setMovedThisTurn(false);
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
          total={CARROT_GOAL}
          unit={strings.farmCarrotsUnit}
          onRestart={restart}
        />
      );
    }
    return (
      <ResultCard
        carrots={soloCarrots}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

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
                ? `${currentName} · ${format(strings.farmCarrotGoal, { current: carrots[currentPlayer], goal: CARROT_GOAL })}`
                : format(strings.farmCarrotGoal, { current: soloCarrots, goal: CARROT_GOAL })}
            </h2>
          </div>
          {!multi && (
            <div className="farm-wood-panel rounded-lg px-3 py-2 text-sm font-extrabold text-amber-950">
              {strings.scoreLabel} {answers.filter((a) => a.correct).length}/{answers.length || 0}
            </div>
          )}
        </div>
        <div className="farm-progress-track mb-3 h-4 overflow-hidden rounded-full">
          <div
            className="farm-progress-fill h-full transition-all"
            style={{
              width: `${Math.min(100, Math.round(((multi ? carrots[currentPlayer] : soloCarrots) / CARROT_GOAL) * 100))}%`,
            }}
          />
        </div>
        <FarmGrid
          cells={cells}
          positions={positions}
          players={players}
          currentIndex={currentPlayer}
          playing={playing}
          movedThisTurn={movedThisTurn}
          onSelectPlot={playing ? moveTo : undefined}
        />
      </section>

      <aside className="flex flex-col gap-4">
        {multi && (
          <TurnBanner
            players={standings}
            currentIndex={currentPlayer}
            scoreUnit={strings.farmCarrotsUnit}
          />
        )}
        <article className="farm-wood-panel rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <FarmerAvatar size={88} animated={playing && movedThisTurn} />
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
              onClick={actionHandler}
              className={`mt-4 w-full rounded-xl px-5 py-4 text-base font-extrabold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] ${actionAccent}`}
            >
              {actionLabel}
            </button>
          ) : playing && movedThisTurn ? (
            <div className="mt-4 grid gap-2">
              {FARM_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={!availableActions.includes(action)}
                  onClick={() => doAction(action)}
                  className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-3 text-left text-sm font-extrabold text-amber-950 shadow-sm ring-2 ring-amber-200/80 transition hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">{ACTION_ICON[action]}</span>
                  {actionLabels[action]}
                </button>
              ))}
              {availableActions.length === 0 && (
                <button
                  type="button"
                  onClick={skipAction}
                  className="rounded-xl bg-amber-800/10 px-4 py-3 text-sm font-extrabold text-amber-950"
                >
                  {strings.farmSkipAction}
                </button>
              )}
            </div>
          ) : playing ? (
            <p className="mt-4 rounded-xl bg-amber-950/10 px-4 py-3 text-center text-sm font-extrabold text-amber-950">
              {strings.farmChooseDestination}
            </p>
          ) : null}
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

function cellCenterPercent(index: number): { x: number; y: number } {
  const { row, col } = indexToPos(index);
  const step = 100 / GRID_SIZE;
  return { x: step * col + step / 2, y: step * row + step / 2 };
}

function FarmGrid({
  cells,
  positions,
  players,
  currentIndex,
  playing,
  movedThisTurn,
  onSelectPlot,
}: {
  cells: FarmCell[];
  positions: number[];
  players: Player[];
  currentIndex: number;
  playing: boolean;
  movedThisTurn: boolean;
  onSelectPlot?: (index: number) => void;
}) {
  const strings = useStrings();
  const format = useFormat();
  const currentPos = positions[currentIndex];

  return (
    <div className="farm-field relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl p-3">
      <span className="pointer-events-none absolute left-2 top-2 text-xl opacity-80" aria-hidden="true">
        🌻
      </span>
      <span className="pointer-events-none absolute right-2 top-2 text-xl opacity-80" aria-hidden="true">
        🌲
      </span>
      <span className="pointer-events-none absolute bottom-2 left-2 text-xl opacity-80" aria-hidden="true">
        🪵
      </span>
      <span className="pointer-events-none absolute bottom-2 right-2 text-xl opacity-80" aria-hidden="true">
        🏠
      </span>

      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1.5">
        {cells.map((plot, index) => {
          const isHere = index === currentPos;
          const canMove = playing && !movedThisTurn;
          const highlight = playing && (canMove || (movedThisTurn && isHere));
          return (
            <FarmPlot
              key={index}
              index={index}
              plot={plot}
              active={isHere}
              reachable={canMove}
              highlight={highlight}
              label={format(strings.farmPlotLabel, { n: index + 1 })}
              onSelect={onSelectPlot}
            />
          );
        })}
      </div>

      <FarmTokens positions={positions} players={players} currentIndex={currentIndex} />
    </div>
  );
}

function FarmPlot({
  index,
  plot,
  active,
  reachable,
  highlight,
  label,
  onSelect,
}: {
  index: number;
  plot: FarmCell;
  active: boolean;
  reachable?: boolean;
  highlight?: boolean;
  label: string;
  onSelect?: (index: number) => void;
}) {
  const decor = plotDecor(plot);
  const tileClass = plot.tree
    ? "farm-tile--crop"
    : plot.mouse
      ? "farm-tile--hole"
      : plot.crop === "ready"
        ? "farm-tile--crop"
        : plot.crop === "seeded" || plot.crop === "watered"
          ? "farm-tile--soil-done"
          : "farm-tile--soil";

  const className = [
    "farm-tile",
    tileClass,
    active ? "farm-tile--active" : "",
    reachable ? "farm-tile--reachable" : "",
    highlight && !reachable ? "ring-2 ring-amber-300" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {decor && (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl"
          aria-hidden="true"
        >
          {decor}
        </span>
      )}
    </>
  );

  if (reachable && onSelect) {
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        onClick={() => onSelect(index)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} aria-label={label}>
      {content}
    </div>
  );
}

function plotDecor(plot: FarmCell): string | null {
  if (plot.mouse) return "🐀";
  if (plot.tree) return plot.treePicked ? "🌳" : "🥕";
  if (plot.crop === "ready") return "🥕";
  if (plot.crop === "watered") return "💧";
  if (plot.crop === "seeded") return "🌱";
  return null;
}

function FarmTokens({
  positions,
  players,
  currentIndex,
}: {
  positions: number[];
  players: Player[];
  currentIndex: number;
}) {
  const spread = players.length > 1;
  return (
    <>
      {players.map((player, i) => {
        const { x, y } = cellCenterPercent(positions[i]);
        const offset = spread ? TOKEN_OFFSETS[i % TOKEN_OFFSETS.length] : { dx: 0, dy: 0 };
        const isActive = i === currentIndex;
        return (
          <div
            key={player.id}
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
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
              }`}
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
    dialogRef.current?.focus();
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
  carrots,
  answers,
  scope,
  onRestart,
}: {
  carrots: number;
  answers: HistoryAnswer[];
  scope: Surah[];
  onRestart: () => void;
}) {
  const strings = useStrings();
  const format = useFormat();
  const savedRef = useRef(false);
  const correct = answers.filter((a) => a.correct).length;

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId: "berkebun",
      score: carrots,
      total: CARROT_GOAL,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [carrots, answers, scope]);

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
        {format(strings.farmCarrotGoal, { current: carrots, goal: CARROT_GOAL })}
      </p>
      <p className="text-base font-bold text-stone-700">
        {strings.scoreLabel}: {correct}/{answers.length || 0}
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
