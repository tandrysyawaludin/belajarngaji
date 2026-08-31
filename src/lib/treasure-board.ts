import { shuffle } from "./random";

export const TREASURE_COUNT = 9;
export const DIAMOND_COUNT = 4;

export type ChestLoot = "diamond" | "empty";

export function createTreasureBoard(): ChestLoot[] {
  const loot: ChestLoot[] = [
    ...Array.from({ length: DIAMOND_COUNT }, () => "diamond" as const),
    ...Array.from(
      { length: TREASURE_COUNT - DIAMOND_COUNT },
      () => "empty" as const,
    ),
  ];
  return shuffle(loot);
}
