"use client";

import { useCallback, useMemo, useState } from "react";
import type { Player } from "./players";

// Round-robin turn manager for question-based games. One question per turn;
// the turn rotates to the next player after each answer. Works for solo too
// (a single player simply always has the turn).
export interface Hotseat {
  players: Player[];
  current: Player;
  turnIndex: number;
  questionNumber: number;
  questionsPerPlayer: number;
  totalQuestions: number;
  isOver: boolean;
  recordResult: (correct: boolean) => void;
  next: () => void;
  reset: () => void;
}

export function useHotseat(
  basePlayers: Player[],
  questionsPerPlayer: number,
): Hotseat {
  const playerCount = Math.max(1, basePlayers.length);
  const [scores, setScores] = useState<number[]>(() =>
    basePlayers.map(() => 0),
  );
  const [questionNumber, setQuestionNumber] = useState(0);

  const totalQuestions = questionsPerPlayer * playerCount;
  const turnIndex = questionNumber % playerCount;
  const isOver = questionNumber >= totalQuestions;

  const players = useMemo<Player[]>(
    () => basePlayers.map((p, i) => ({ ...p, score: scores[i] ?? 0 })),
    [basePlayers, scores],
  );

  const recordResult = useCallback(
    (correct: boolean) => {
      if (!correct) return;
      setScores((prev) =>
        prev.map((value, i) =>
          i === questionNumber % playerCount ? value + 1 : value,
        ),
      );
    },
    [questionNumber, playerCount],
  );

  const next = useCallback(() => setQuestionNumber((n) => n + 1), []);

  const reset = useCallback(() => {
    setScores(basePlayers.map(() => 0));
    setQuestionNumber(0);
  }, [basePlayers]);

  return {
    players,
    current: players[turnIndex],
    turnIndex,
    questionNumber,
    questionsPerPlayer,
    totalQuestions,
    isOver,
    recordResult,
    next,
    reset,
  };
}
