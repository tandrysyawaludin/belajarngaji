"use client";

import { MascotImage } from "./MascotImage";
import { useTheme } from "./ThemeProvider";

interface ThemedMascotProps {
  size?: number;
  mood?: "happy" | "excited" | "sad" | "thinking";
  className?: string;
}

/** Drop-in mascot that follows the active theme. */
export function ThemedMascot(props: ThemedMascotProps) {
  const { theme } = useTheme();
  return <MascotImage {...props} theme={theme} />;
}
