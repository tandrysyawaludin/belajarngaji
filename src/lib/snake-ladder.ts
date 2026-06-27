import type { Surah } from "@/data/surahs";

export const BOARD_SIZE = 30;

export const BOARD_JUMPS: Record<number, number> = {
  3: 11,
  6: 17,
  9: 18,
  14: 4,
  19: 8,
  22: 29,
  24: 16,
  27: 1,
};

export type SnakeLadderQuestionKind = "meaning" | "verses" | "name" | "number";

export interface SnakeLadderQuestion {
  kind: SnakeLadderQuestionKind;
  surah: Surah;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

export interface AnsweredMoveInput {
  previousPosition: number;
  targetPosition: number;
  isCorrect: boolean;
}

export interface BoardJump {
  from: number;
  to: number;
  type: "ladder" | "snake";
}

export interface AnsweredMoveResult {
  position: number;
  jump: BoardJump | null;
}

export function getMoveTarget(position: number, diceRoll: number): number {
  const safePosition = clampSquare(position);
  const safeRoll = Math.min(6, Math.max(1, Math.floor(diceRoll)));
  return Math.min(BOARD_SIZE, safePosition + safeRoll);
}

export function resolveAnsweredMove({
  previousPosition,
  targetPosition,
  isCorrect,
}: AnsweredMoveInput): AnsweredMoveResult {
  if (!isCorrect) {
    return {
      position: clampSquare(previousPosition),
      jump: null,
    };
  }

  const safeTarget = clampSquare(targetPosition);
  const jumpTo = BOARD_JUMPS[safeTarget];
  if (jumpTo === undefined) {
    return {
      position: safeTarget,
      jump: null,
    };
  }

  return {
    position: jumpTo,
    jump: {
      from: safeTarget,
      to: jumpTo,
      type: jumpTo > safeTarget ? "ladder" : "snake",
    },
  };
}

export function buildSnakeLadderQuestion(
  scope: readonly Surah[],
  random: () => number = Math.random,
  usedKeys: ReadonlySet<string> = new Set(),
): SnakeLadderQuestion {
  if (scope.length === 0) {
    throw new Error("Snake and Ladder needs at least one surah in scope.");
  }
  const allQuestions = scope.flatMap((surah) => [
    buildQuestionForSurah(surah, "meaning", scope, random),
    buildQuestionForSurah(surah, "verses", scope, random),
    buildQuestionForSurah(surah, "name", scope, random),
    buildQuestionForSurah(surah, "number", scope, random),
  ]);
  const available = allQuestions.filter(
    (question) => !usedKeys.has(getSnakeLadderQuestionKey(question)),
  );
  if (available.length === 0) {
    throw new Error("All Snake and Ladder questions have been used.");
  }
  return available[randomIndex(available.length, random)];
}

export function getSnakeLadderQuestionKey(question: SnakeLadderQuestion): string {
  return `${question.kind}:${question.surah.number}`;
}

function buildQuestionForSurah(
  surah: Surah,
  kind: SnakeLadderQuestionKind,
  scope: readonly Surah[],
  random: () => number,
): SnakeLadderQuestion {
  if (kind === "meaning") {
    const correctAnswer = surah.meaning;
    return {
      kind,
      surah,
      prompt: `Apa arti dari surah ${surah.name}?`,
      options: buildStringOptions(
        correctAnswer,
        scope.map((item) => item.meaning),
        random,
      ),
      correctAnswer,
    };
  }

  if (kind === "name") {
    const correctAnswer = surah.name;
    return {
      kind,
      surah,
      prompt: `Surah apa yang artinya ${surah.meaning}?`,
      options: buildStringOptions(
        correctAnswer,
        scope.map((item) => item.name),
        random,
      ),
      correctAnswer,
    };
  }

  if (kind === "number") {
    const correctAnswer = `Surah ke-${surah.number}`;
    return {
      kind,
      surah,
      prompt: `${surah.name} adalah surah nomor berapa?`,
      options: buildStringOptions(
        correctAnswer,
        scope.map((item) => `Surah ke-${item.number}`),
        random,
      ),
      correctAnswer,
    };
  }

  const correctAnswer = `${surah.verses} ayat`;
  return {
    kind,
    surah,
    prompt: `Berapa jumlah ayat dalam surah ${surah.name}?`,
    options: buildStringOptions(
      correctAnswer,
      scope.map((item) => `${item.verses} ayat`),
      random,
    ),
    correctAnswer,
  };
}

function buildStringOptions(
  correctAnswer: string,
  candidates: readonly string[],
  random: () => number,
): string[] {
  const unique = new Set<string>([correctAnswer]);
  for (const candidate of shuffle(candidates, random)) {
    if (unique.size >= 4) break;
    unique.add(candidate);
  }
  let fallbackNumber = 3;
  while (unique.size < 4) {
    unique.add(`${fallbackNumber} ayat`);
    fallbackNumber += 1;
  }
  return shuffle(Array.from(unique), random);
}

function randomIndex(length: number, random: () => number): number {
  return Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
}

function clampSquare(square: number): number {
  return Math.min(BOARD_SIZE, Math.max(1, Math.floor(square)));
}

function shuffle<T>(input: readonly T[], random: () => number): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
