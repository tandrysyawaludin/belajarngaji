"use client";

import { useStrings } from "@/components/LocaleProvider";
import { useTheme } from "./ThemeProvider";

/**
 * Small header-tile that shows the active theme and opens the picker on click.
 * Renders as a client component so it can read the active theme from context.
 */
export function ThemeBadge() {
  const strings = useStrings();
  const { theme, openPicker } = useTheme();
  return (
    <button
      type="button"
      onClick={openPicker}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold shadow-sm ring-2 transition hover:brightness-95 active:scale-95"
      style={{
        backgroundColor: "var(--theme-primary-soft)",
        color: "var(--theme-primary-deep)",
        borderColor: "var(--theme-primary)",
      }}
      aria-label={`${strings.themeChangeButton}: ${theme.name}`}
    >
      <span aria-hidden="true">🎨</span>
      <span>
        {strings.navTheme}: {theme.name}
      </span>
    </button>
  );
}
