export const GRID_SIZE = 3;
export const GRID_CELLS = GRID_SIZE * GRID_SIZE;
export const MOUSE_COUNT = 2;
export const CARROT_GOAL = 3;

export type CropStage = "none" | "seeded" | "watered" | "ready";
export type FarmAction = "kill" | "seed" | "water" | "harvest" | "tree";

export type FarmCell = {
  mouse: boolean;
  tree: boolean;
  treePicked: boolean;
  crop: CropStage;
};

export type GridPos = { row: number; col: number };

export function cellIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

export function indexToPos(index: number): GridPos {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

export function posKey(pos: GridPos): string {
  return `${pos.row},${pos.col}`;
}

function pickDistinctIndices(count: number, random: () => number): number[] {
  const picked = new Set<number>();
  let guard = 0;
  while (picked.size < count && guard < GRID_CELLS * 4) {
    picked.add(Math.floor(random() * GRID_CELLS));
    guard += 1;
  }
  if (picked.size < count) {
    for (let i = 0; picked.size < count && i < GRID_CELLS; i += 1) {
      picked.add(i);
    }
  }
  return Array.from(picked);
}

export function createFarm(random: () => number = Math.random): FarmCell[] {
  const mouseSlots = pickDistinctIndices(MOUSE_COUNT, random);
  const treeCandidates = Array.from({ length: GRID_CELLS }, (_, i) => i).filter(
    (i) => !mouseSlots.includes(i),
  );
  const treeSlot = treeCandidates[Math.floor(random() * treeCandidates.length)];

  return Array.from({ length: GRID_CELLS }, (_, index) => ({
    mouse: mouseSlots.includes(index),
    tree: index === treeSlot,
    treePicked: false,
    crop: "none" as CropStage,
  }));
}

export function canDoAction(cell: FarmCell, action: FarmAction): boolean {
  switch (action) {
    case "kill":
      return cell.mouse;
    case "seed":
      return !cell.mouse && !cell.tree && cell.crop === "none";
    case "water":
      return !cell.mouse && !cell.tree && cell.crop === "seeded";
    case "harvest":
      return !cell.mouse && !cell.tree && cell.crop === "ready";
    case "tree":
      return cell.tree && !cell.treePicked;
    default:
      return false;
  }
}

export function applyAction(
  cell: FarmCell,
  action: FarmAction,
): { cell: FarmCell; carrot: boolean } {
  if (!canDoAction(cell, action)) {
    return { cell, carrot: false };
  }

  if (action === "kill") {
    return { cell: { ...cell, mouse: false }, carrot: false };
  }
  if (action === "seed") {
    return { cell: { ...cell, crop: "seeded" }, carrot: false };
  }
  if (action === "water") {
    return { cell: { ...cell, crop: "ready" }, carrot: false };
  }
  if (action === "harvest") {
    return { cell: { ...cell, crop: "none" }, carrot: true };
  }
  return { cell: { ...cell, treePicked: true }, carrot: true };
}

export const FARM_ACTIONS: readonly FarmAction[] = [
  "kill",
  "seed",
  "water",
  "harvest",
  "tree",
];
