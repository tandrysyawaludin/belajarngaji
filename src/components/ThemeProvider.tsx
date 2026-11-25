"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getTheme, type ThemeDef } from "@/lib/themes";

/**
 * v2 house theme: there is exactly ONE theme — Dreamy Sky.
 * The old multi-theme picker is gone on purpose: every child, on every
 * device, lands on the same sky-blue / white / baby-pink world.
 */
interface ThemeContextValue {
  theme: ThemeDef;
  setTheme: (id: ThemeDef["id"]) => void;
  openPicker: () => void;
}

const HOUSE_THEME = getTheme("awan");
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "awan");
    try {
      window.localStorage.removeItem("belajarngaji:theme");
      window.localStorage.setItem("belajarngaji:theme:v2", "awan");
    } catch { /* storage unavailable */ }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: HOUSE_THEME, setTheme: () => {}, openPicker: () => {} }),
    [],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: HOUSE_THEME, setTheme: () => {}, openPicker: () => {} };
  return ctx;
}
