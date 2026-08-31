"use client";

import { useEffect, useRef, useState } from "react";
import type { Surah } from "@/data/surahs";
import { useStrings } from "@/components/LocaleProvider";
import { addEntry, type HistoryAnswer } from "@/lib/history";
import { isMultiplayer, type Player } from "@/lib/players";
import {
  boardWinner,
  emptyBoard,
  isDraw,
  pickAiMove,
  placeMark,
  winningLine,
  type Board,
  type Mark,
} from "@/lib/tic-tac-toe";
import {
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  type SnakeLadderQuestion,
} from "@/lib/snake-ladder";
import { BoardQuestionModal } from "./BoardQuestionModal";
import { FeedbackOverlay, fireConfetti, type FeedbackKind } from "./Feedback";
import { MultiplayerResult } from "./MultiplayerResult";
import { ThemedMascot } from "./ThemedMascot";
import { TurnBanner } from "./TurnBanner";

type Phase = "ask" | "answering" | "place" | "ai" | "wrong" | "won";

function markForPlayer(playerIndex: number): Mark {
  return playerIndex % 2 === 0 ? "X" : "O";
}

export function TicTacToeGame({
  scope,
  players,
}: {
  scope: Surah[];
  players: Player[];
}) {
  const strings = useStrings();
  const multi = isMultiplayer(players);
  const seats = multi ? players.slice(0, 2) : players;
  const [board, setBoard] = useState<Board>(() => emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [turnQuestion, setTurnQuestion] = useState<SnakeLadderQuestion | null>(
    null,
  );
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [answers, setAnswers] = useState<HistoryAnswer[]>([]);
  const [winnerMark, setWinnerMark] = useState<Mark | "draw" | null>(null);
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const currentName = seats[currentPlayer]?.name ?? strings.tttYou;
  const currentMark = markForPlayer(currentPlayer);
  const line = winningLine(board);
  const soloScore = answers.filter((a) => a.correct).length;
  const standings = seats.map((player, i) => ({
    ...player,
    score:
      winnerMark === "draw"
        ? 1
        : winnerMark === markForPlayer(i)
          ? 1
          : 0,
  }));

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
    };
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, ms);
      timersRef.current.push(timer);
    });

  const finishIfOver = (next: Board) => {
    const won = boardWinner(next);
    if (won) {
      setWinnerMark(won);
      setPhase("won");
      return true;
    }
    if (isDraw(next)) {
      setWinnerMark("draw");
      setPhase("won");
      return true;
    }
    return false;
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
    setTurnQuestion(null);
    if (correct) {
      setPhase("place");
      return;
    }
    setFeedback("wrong");
    setPhase("wrong");
  };

  const endTurn = () => {
    setFeedback(null);
    if (!multi) {
      setPhase("ask");
      return;
    }
    setCurrentPlayer((p) => (p + 1) % seats.length);
    setPhase("ask");
  };

  const playHuman = async (index: number) => {
    if (phase !== "place") return;
    const next = placeMark(board, index, currentMark);
    if (!next) return;
    setBoard(next);
    setLastPlaced(index);
    if (finishIfOver(next)) return;
    if (!multi) {
      setPhase("ai");
      await wait(520);
      const aiIndex = pickAiMove(next);
      const afterAi = placeMark(next, aiIndex, "O");
      if (afterAi) {
        setBoard(afterAi);
        setLastPlaced(aiIndex);
        if (finishIfOver(afterAi)) return;
      }
      setPhase("ask");
      return;
    }
    setCurrentPlayer((p) => (p + 1) % seats.length);
    setPhase("ask");
  };

  const restart = () => {
    setBoard(emptyBoard());
    setCurrentPlayer(0);
    setPhase("ask");
    setTurnQuestion(null);
    setFeedback(null);
    setAnswers([]);
    setWinnerMark(null);
    setUsedQuestionKeys(new Set());
    setLastPlaced(null);
  };

  if (winnerMark !== null) {
    if (multi) {
      return (
        <MultiplayerResult
          players={standings}
          gameId="tic-tac-toe"
          scope={scope}
          total={1}
          unit={strings.tttWinsUnit}
          onRestart={restart}
        />
      );
    }
    return (
      <TttResult
        title={
          winnerMark === "draw"
            ? strings.tttDrawTitle
            : winnerMark === "X"
              ? strings.tttWinTitle
              : strings.tttLoseTitle
        }
        score={soloScore}
        total={answers.length}
        answers={answers}
        scope={scope}
        onRestart={restart}
      />
    );
  }

  const status =
    phase === "place"
      ? strings.tttPickCell
      : phase === "ai"
        ? strings.tttComputerTurn
        : phase === "wrong"
          ? multi
            ? strings.wrongTurnPass
            : strings.wrongTurnRetry
          : strings.tttAnswerFirst;

  return (
    <div className="flex flex-col gap-4">
      {multi ? (
        <TurnBanner
          players={standings.map((player, i) => ({
            ...player,
            score: 0,
            name: `${player.name} (${markForPlayer(i)})`,
          }))}
          currentIndex={currentPlayer}
          scoreUnit={strings.tttWinsUnit}
        />
      ) : (
        <p className="text-sm font-extrabold text-sky-900">
          {strings.tttYou} = X · {strings.tttComputer} = O
        </p>
      )}

      <section className="bg-gradient-to-br from-sky-100 via-violet-50 to-rose-100 p-4 shadow-lg ring-4 ring-white/70">
        <div className="mb-3">
          <p className="text-sm font-extrabold uppercase tracking-wide text-sky-600">
            {strings.tttBoardTitle}
          </p>
          <h2 className="text-xl font-extrabold text-sky-950">
            {multi ? `${currentName} (${currentMark}) · ${status}` : status}
          </h2>
        </div>
        <div className="ttt-board mx-auto grid aspect-square w-full max-w-sm grid-cols-3 grid-rows-3 gap-2 p-2">
          {board.map((cell, index) => {
            const isWin = line?.includes(index);
            const justPlaced = lastPlaced === index;
            return (
              <button
                key={index}
                type="button"
                disabled={phase !== "place" || cell !== null}
                onClick={() => void playHuman(index)}
                className={`ttt-cell ${isWin ? "is-win" : ""} ${
                  phase === "place" && !cell ? "is-ready" : ""
                }`}
                aria-label={`${strings.tttCellLabel} ${index + 1}`}
              >
                {cell ? (
                  <span
                    className={`ttt-mark ttt-mark--${cell} ${
                      justPlaced ? "pop-in" : ""
                    }`}
                  >
                    {cell}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {(phase === "ask" || phase === "wrong") && (
        <button
          type="button"
          onClick={phase === "ask" ? openQuestion : endTurn}
          className="w-full bg-sky-500 px-6 py-3 text-lg font-extrabold text-white shadow-md transition hover:bg-sky-600 active:scale-95"
        >
          {phase === "wrong"
            ? multi
              ? strings.nextPlayer
              : strings.retry
            : strings.snakeAnswerQuestion}
        </button>
      )}

      {phase === "answering" && turnQuestion && (
        <BoardQuestionModal
          question={turnQuestion}
          playerName={multi ? currentName : null}
          onChoose={chooseAnswer}
        />
      )}
      <FeedbackOverlay kind={feedback} onDone={() => setFeedback(null)} />
    </div>
  );
}

function TttResult({
  title,
  score,
  total,
  answers,
  scope,
  onRestart,
}: {
  title: string;
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
      gameId: "tic-tac-toe",
      score,
      total,
      answers,
      scopeNumbers: scope.map((s) => s.number),
    });
  }, [answers, scope, score, total]);

  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <article className="flex flex-col items-center gap-4 bg-gradient-to-br from-sky-100 via-violet-50 to-rose-100 p-8 text-center shadow-lg ring-4 ring-white/70">
      <ThemedMascot size={140} mood="excited" className="wobble" />
      <h2 className="text-3xl font-extrabold text-sky-800">{title}</h2>
      <p className="text-xl font-extrabold text-sky-950">
        {strings.scoreLabel} {score}/{total}
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="bg-sky-500 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-sky-600 active:scale-95"
      >
        {strings.playAgain}
      </button>
    </article>
  );
}
