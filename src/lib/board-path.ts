import { BOARD_SIZE } from "./snake-ladder";

export const BOARD_COLS = 6;
export const BOARD_ROWS = Math.ceil(BOARD_SIZE / BOARD_COLS);
export const CELL_UNIT = 20;

export function squareCoords(square: number): { col: number; rowFromTop: number } {
  const index = square - 1;
  const row = Math.floor(index / BOARD_COLS);
  const colInRow = index % BOARD_COLS;
  const col = row % 2 === 0 ? colInRow : BOARD_COLS - 1 - colInRow;
  return { col, rowFromTop: BOARD_ROWS - 1 - row };
}

export const DISPLAY_SQUARES: number[] = [];
for (let rowFromTop = 0; rowFromTop < BOARD_ROWS; rowFromTop += 1) {
  const row = BOARD_ROWS - 1 - rowFromTop;
  for (let col = 0; col < BOARD_COLS; col += 1) {
    const colInRow = row % 2 === 0 ? col : BOARD_COLS - 1 - col;
    DISPLAY_SQUARES.push(row * BOARD_COLS + colInRow + 1);
  }
}

export function centerPercent(square: number): { x: number; y: number } {
  const { col, rowFromTop } = squareCoords(square);
  return {
    x: ((col + 0.5) / BOARD_COLS) * 100,
    y: ((rowFromTop + 0.5) / BOARD_ROWS) * 100,
  };
}

export function centerSvg(square: number): { x: number; y: number } {
  const { col, rowFromTop } = squareCoords(square);
  return {
    x: (col + 0.5) * CELL_UNIT,
    y: (rowFromTop + 0.5) * CELL_UNIT,
  };
}
