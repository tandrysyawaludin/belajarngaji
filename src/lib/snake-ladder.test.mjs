import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOARD_SIZE,
  BOARD_JUMPS,
  buildSnakeLadderQuestion,
  getSnakeLadderQuestionKey,
  getMoveTarget,
  resolveAnsweredMove,
} from "./snake-ladder.ts";

const scope = [
  {
    number: 1,
    name: "Al-Fatihah",
    arabic: "الفاتحة",
    meaning: "Pembukaan",
    verses: 7,
    revelation: "Makkiyah",
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    arabic: "الإخلاص",
    meaning: "Memurnikan Keesaan Allah",
    verses: 4,
    revelation: "Makkiyah",
  },
  {
    number: 113,
    name: "Al-Falaq",
    arabic: "الفلق",
    meaning: "Waktu Subuh",
    verses: 5,
    revelation: "Makkiyah",
  },
  {
    number: 114,
    name: "An-Nas",
    arabic: "الناس",
    meaning: "Manusia",
    verses: 6,
    revelation: "Makkiyah",
  },
];

describe("Snake and Ladder movement", () => {
  it("moves forward by dice roll without passing the final square", () => {
    assert.equal(getMoveTarget(1, 4), 5);
    assert.equal(getMoveTarget(BOARD_SIZE - 1, 6), BOARD_SIZE);
  });

  it("returns to the previous square when the answer is wrong", () => {
    const result = resolveAnsweredMove({
      previousPosition: 5,
      targetPosition: 9,
      isCorrect: false,
    });

    assert.equal(result.position, 5);
    assert.equal(result.jump, null);
  });

  it("applies a ladder or snake only after a correct answer", () => {
    const targetPosition = 3;
    const result = resolveAnsweredMove({
      previousPosition: 1,
      targetPosition,
      isCorrect: true,
    });

    assert.equal(result.position, BOARD_JUMPS[targetPosition]);
    assert.equal(result.jump?.from, targetPosition);
    assert.equal(result.jump?.to, BOARD_JUMPS[targetPosition]);
  });
});

describe("Snake and Ladder answer-first turn", () => {
  it("rolls and moves (then climbs a ladder) after a correct answer", () => {
    // Answer-first flow: a correct answer unlocks the dice. From square 1 a
    // roll of 2 lands on square 3, which is a ladder up to square 11.
    const from = 1;
    const dice = 2;
    const target = getMoveTarget(from, dice);
    assert.equal(target, 3);

    const result = resolveAnsweredMove({
      previousPosition: from,
      targetPosition: target,
      isCorrect: true,
    });
    assert.equal(result.position, BOARD_JUMPS[3]);
    assert.equal(result.jump?.type, "ladder");
  });

  it("keeps the player on their square when the answer is wrong (no roll)", () => {
    // A wrong answer means the player never rolls, so they stay put and the
    // turn passes to the next player.
    const from = 5;
    const result = resolveAnsweredMove({
      previousPosition: from,
      targetPosition: getMoveTarget(from, 6),
      isCorrect: false,
    });
    assert.equal(result.position, from);
    assert.equal(result.jump, null);
  });
});

describe("Snake and Ladder questions", () => {
  it("builds a random multiple-choice Quran question from the active scope", () => {
    const question = buildSnakeLadderQuestion(scope, () => 0);

    assert.equal(question.surah.name, "Al-Fatihah");
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.correctAnswer));
    assert.match(question.prompt, /Al-Fatihah/);
  });

  it("skips question keys that were already used in the session", () => {
    const firstQuestion = buildSnakeLadderQuestion(scope, () => 0);
    const firstKey = getSnakeLadderQuestionKey(firstQuestion);
    const nextQuestion = buildSnakeLadderQuestion(scope, () => 0, new Set([firstKey]));

    assert.notEqual(getSnakeLadderQuestionKey(nextQuestion), firstKey);
  });

  it("does not fall back to repeated questions when the session pool is exhausted", () => {
    const allKeys = new Set();
    for (const surah of scope) {
      allKeys.add(`meaning:${surah.number}`);
      allKeys.add(`verses:${surah.number}`);
      allKeys.add(`name:${surah.number}`);
      allKeys.add(`number:${surah.number}`);
    }

    assert.throws(
      () => buildSnakeLadderQuestion(scope, () => 0, allKeys),
      /All Snake and Ladder questions have been used/,
    );
  });
});
