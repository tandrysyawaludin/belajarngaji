// Theme registry. Each theme is one original pixel-art character (2 girls in a
// hijab, 2 boys in a peci cap) with its own pastel palette. The artwork is
// drawn as inline SVG in `src/components/PixelMascot.tsx` and tinted from the
// palette below — no image files, no third-party characters.

export interface ThemePalette {
  /** Strong primary color — used for nav highlights and accents. */
  primary: string;
  /** Darker variant for borders / deep text. */
  primaryDeep: string;
  /** Very soft tint for backgrounds and placeholder fills. */
  primarySoft: string;
  /** Secondary accent. */
  accent: string;
  /** Three radial gradient stops painted onto <body>. */
  bgStops: [string, string, string];
  /** Solid background base behind the gradients. */
  bgBase: string;
}

export type Gender = "girl" | "boy";
/** Headwear: "muslim" = hijab (girl) / peci (boy), plus a round hat and cowboy hat. */
export type HatKind = "muslim" | "hat" | "cowboy";

export interface ThemeDef {
  id: string;
  /** Display name. */
  name: string;
  /** Short, kid-friendly tagline. */
  tagline: string;
  /** Whether the pixel-art mascot is a girl or a boy. */
  gender: Gender;
  /** Which headwear the mascot wears. */
  hat: HatKind;
  palette: ThemePalette;
}

export const THEMES: readonly ThemeDef[] = [
  {
    id: "nadia",
    name: "Pinky",
    tagline: "Anak perempuan berhijab pink",
    gender: "girl",
    hat: "muslim",
    palette: {
      primary: "#fb6f92",
      primaryDeep: "#c81e5b",
      primarySoft: "#ffd6e2",
      accent: "#ffa9c4",
      bgStops: ["#ffe4ee", "#ffd6e6", "#fff3d6"],
      bgBase: "#fff0f5",
    },
  },
  {
    id: "sinta",
    name: "Tealy",
    tagline: "Si ceria bertopi toska",
    gender: "girl",
    hat: "hat",
    palette: {
      primary: "#14b8a6",
      primaryDeep: "#0f766e",
      primarySoft: "#ccfbf1",
      accent: "#5eead4",
      bgStops: ["#ccfbf1", "#cffafe", "#fef9c3"],
      bgBase: "#f0fdfa",
    },
  },
  {
    id: "maya",
    name: "Yellowy",
    tagline: "Koboi cilik bertopi kuning",
    gender: "girl",
    hat: "cowboy",
    palette: {
      primary: "#f59e0b",
      primaryDeep: "#b45309",
      primarySoft: "#fef3c7",
      accent: "#fcd34d",
      bgStops: ["#fff3a3", "#ffe8c2", "#ffe4d6"],
      bgBase: "#fff8e1",
    },
  },
  {
    id: "rian",
    name: "Bluey",
    tagline: "Anak laki-laki berpeci biru",
    gender: "boy",
    hat: "muslim",
    palette: {
      primary: "#3b82f6",
      primaryDeep: "#1d4ed8",
      primarySoft: "#d6e6ff",
      accent: "#93c5fd",
      bgStops: ["#dcebff", "#e7f2ff", "#fef3c7"],
      bgBase: "#eff6ff",
    },
  },
  {
    id: "dimas",
    name: "Greeny",
    tagline: "Si ceria bertopi hijau",
    gender: "boy",
    hat: "hat",
    palette: {
      primary: "#10b981",
      primaryDeep: "#047857",
      primarySoft: "#d1fae5",
      accent: "#6ee7b7",
      bgStops: ["#d1fae5", "#dcfce7", "#fef9c3"],
      bgBase: "#ecfdf5",
    },
  },
  {
    id: "bayu",
    name: "Purpley",
    tagline: "Koboi cilik bertopi ungu",
    gender: "boy",
    hat: "cowboy",
    palette: {
      primary: "#9b6dff",
      primaryDeep: "#6d28d9",
      primarySoft: "#e7defc",
      accent: "#c4b1ff",
      bgStops: ["#ece2ff", "#f3e3ff", "#e0d4ff"],
      bgBase: "#f5f0ff",
    },
  },
] as const;

export const DEFAULT_THEME_ID = "nadia";

export function getTheme(id: string | null | undefined): ThemeDef {
  if (!id) return THEMES[0];
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function isThemeId(value: unknown): value is ThemeDef["id"] {
  return typeof value === "string" && THEMES.some((t) => t.id === value);
}
