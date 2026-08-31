export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export const WIN_LINES: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function emptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

export function emptyIndexes(board: Board): number[] {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

export function winningLine(board: Board): [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) return line;
  }
  return null;
}

export function boardWinner(board: Board): Mark | null {
  const line = winningLine(board);
  return line ? board[line[0]] ?? null : null;
}

export function isDraw(board: Board): boolean {
  return board.every(Boolean) && !boardWinner(board);
}

export function placeMark(board: Board, index: number, mark: Mark): Board | null {
  if (index < 0 || index > 8 || board[index]) return null;
  const next = [...board] as Board;
  next[index] = mark;
  return next;
}

function wouldWin(board: Board, index: number, mark: Mark): boolean {
  const next = placeMark(board, index, mark);
  return next ? boardWinner(next) === mark : false;
}

export function pickAiMove(board: Board, ai: Mark = "O", human: Mark = "X"): number {
  const open = emptyIndexes(board);
  const winNow = open.find((index) => wouldWin(board, index, ai));
  if (winNow !== undefined) return winNow;
  const block = open.find((index) => wouldWin(board, index, human));
  if (block !== undefined) return block;
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)] ?? open[0] ?? 0;
  const sides = [1, 3, 5, 7].filter((index) => board[index] === null);
  return sides[0] ?? open[0] ?? 0;
}
