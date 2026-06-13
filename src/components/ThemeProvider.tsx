"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  type ThemeDef,
} from "@/lib/themes";
import {
  hasShownPickerThisSession,
  markPickerShown,
  readThemeId,
  subscribeSessionShown,
  subscribeTheme,
  writeThemeId,
} from "@/lib/theme";
import { ThemePicker } from "./ThemePicker";

interface ThemeContextValue {
  theme: ThemeDef;
  setTheme: (id: ThemeDef["id"]) => void;
  openPicker: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useStoredThemeId(): string | null {
  const subscribe = useCallback((cb: () => void) => subscribeTheme(cb), []);
  const getSnapshot = useCallback(() => readThemeId(), []);
  const getServerSnapshot = useCallback((): string | null => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function useShownThisSession(): boolean {
  const subscribe = useCallback(
    (cb: () => void) => subscribeSessionShown(cb),
    [],
  );
  const getSnapshot = useCallback(() => hasShownPickerThisSession(), []);
  // SSR & first paint: treat as "not yet shown" so the picker reliably opens
  // on the very first client render — matching the kid's expectation of
  // seeing the picker every time she opens the app fresh.
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedId = useStoredThemeId();
  const shownThisSession = useShownThisSession();
  // Tri-state picker visibility:
  //   null  = "auto" — open on first session/visit
  //   true  = explicitly opened via the Ganti Tema button
  //   false = explicitly dismissed for this session
  const [pickerVisible, setPickerVisible] = useState<boolean | null>(null);

  const theme = useMemo(() => getTheme(storedId), [storedId]);

  // Mirror the active theme onto <html data-theme=...> so the CSS variables
  // defined in globals.css cascade. This works hand-in-hand with the bootstrap
  // script in layout.tsx that sets the attribute synchronously pre-paint.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme.id);
  }, [theme.id]);

  const pickerOpen =
    pickerVisible === true || (pickerVisible === null && !shownThisSession);

  const setTheme = useCallback((id: ThemeDef["id"]) => {
    writeThemeId(id);
    setPickerVisible(false);
  }, []);

  const openPicker = useCallback(() => setPickerVisible(true), []);

  const handleDismiss = useCallback(() => {
    setPickerVisible(false);
    markPickerShown();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, openPicker }),
    [theme, setTheme, openPicker],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {pickerOpen && (
        <ThemePicker
          themes={THEMES}
          currentId={storedId ?? DEFAULT_THEME_ID}
          onPick={setTheme}
          onDismiss={handleDismiss}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  // If used outside the provider (e.g. SSR before hydration), gracefully
  // fall back to the default theme so we never crash.
  if (!ctx) {
    return {
      theme: getTheme(DEFAULT_THEME_ID),
      setTheme: () => {},
      openPicker: () => {},
    };
  }
  return ctx;
}
