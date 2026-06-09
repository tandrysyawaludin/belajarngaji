export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sampleUnique<T>(pool: readonly T[], count: number, exclude?: T): T[] {
  const filtered = exclude !== undefined ? pool.filter((x) => x !== exclude) : [...pool];
  return shuffle(filtered).slice(0, count);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
