import { BOARD_SIZE } from "./snake-ladder";

export const MOVE_RANGE_MIN = 1;
export const MOVE_RANGE_MAX = 4;

export function rollMoveRange(random: () => number = Math.random): number {
  const span = MOVE_RANGE_MAX - MOVE_RANGE_MIN + 1;
  return MOVE_RANGE_MIN + Math.floor(random() * span);
}

/** Forward plots the player may walk to this turn (along the farm path). */
export function getForwardReach(from: number, range: number): number[] {
  const start = Math.max(1, Math.floor(from));
  const end = Math.min(BOARD_SIZE, start + Math.max(0, Math.floor(range)));
  const squares: number[] = [];
  for (let square = start + 1; square <= end; square += 1) {
    squares.push(square);
  }
  return squares;
}
