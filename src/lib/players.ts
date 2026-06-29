// Local "hotseat" multiplayer: a handful of players take turns on one device.
// A solo game is simply a single-element player list, so games can share one
// code path for both modes.

export interface Player {
  id: number;
  name: string;
  score: number;
}

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export function defaultPlayerName(index: number): string {
  return `Pemain ${index + 1}`;
}

export function makePlayers(count: number, names?: string[]): Player[] {
  const safe = Math.max(1, Math.floor(count));
  return Array.from({ length: safe }, (_, i) => ({
    id: i,
    name: names?.[i]?.trim() ? names[i].trim() : defaultPlayerName(i),
    score: 0,
  }));
}

export function isMultiplayer(players: Player[]): boolean {
  return players.length > 1;
}

export function playersKey(players: Player[]): string {
  return players.map((p) => p.name).join("|");
}

// Distinct visual themes per player seat. Used for turn banners, scoreboards
// and the Snake & Ladder tokens.
export interface PlayerTheme {
  token: string;
  chip: string;
  active: string;
  dot: string;
}

export const PLAYER_THEMES: PlayerTheme[] = [
  {
    token: "🐔",
    chip: "bg-rose-100 text-rose-800 ring-rose-200",
    active: "bg-rose-500 text-white ring-rose-300",
    dot: "bg-rose-500",
  },
  {
    token: "🐤",
    chip: "bg-sky-100 text-sky-800 ring-sky-200",
    active: "bg-sky-500 text-white ring-sky-300",
    dot: "bg-sky-500",
  },
  {
    token: "🐥",
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    active: "bg-amber-500 text-white ring-amber-300",
    dot: "bg-amber-500",
  },
  {
    token: "🦆",
    chip: "bg-violet-100 text-violet-800 ring-violet-200",
    active: "bg-violet-500 text-white ring-violet-300",
    dot: "bg-violet-500",
  },
];

export function playerTheme(index: number): PlayerTheme {
  return PLAYER_THEMES[index % PLAYER_THEMES.length];
}
