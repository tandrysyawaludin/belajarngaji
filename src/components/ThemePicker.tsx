"use client";

import { useEffect } from "react";
import type { ThemeDef } from "@/lib/themes";
import { strings } from "@/lib/strings";
import { MascotImage } from "./MascotImage";

interface ThemePickerProps {
  themes: readonly ThemeDef[];
  currentId: ThemeDef["id"];
  onPick: (id: ThemeDef["id"]) => void;
  onDismiss: () => void;
}

export function ThemePicker({
  themes,
  currentId,
  onPick,
  onDismiss,
}: ThemePickerProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={strings.themePickerTitle}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-pink-50 to-yellow-50 shadow-2xl ring-4 ring-white/70">
        <header className="flex items-start justify-between gap-3 border-b-2 border-pink-100 bg-white/85 p-5">
          <div>
            <h2 className="text-2xl font-extrabold text-pink-700 sm:text-3xl">
              🎨 {strings.themePickerTitle}
            </h2>
            <p className="mt-1 text-sm font-semibold text-pink-900/70 sm:text-base">
              {strings.themePickerSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl font-extrabold text-pink-700 shadow-md ring-2 ring-pink-200 transition hover:bg-pink-50 active:scale-95"
            aria-label={strings.themePickerSkip}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {themes.map((t) => {
              const isCurrent = t.id === currentId;
              return (
                <li key={t.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onPick(t.id)}
                    className={`group flex w-full flex-col items-center gap-2 overflow-hidden rounded-3xl p-4 text-center shadow-sm ring-4 transition active:scale-[0.97] ${
                      isCurrent
                        ? "ring-pink-400"
                        : "ring-white/70 hover:ring-pink-200"
                    }`}
                    style={{
                      background: `linear-gradient(160deg, ${t.palette.bgStops[0]}, ${t.palette.bgStops[2]})`,
                    }}
                    aria-pressed={isCurrent}
                  >
                    <div
                      className="grid h-24 w-24 place-items-center rounded-full shadow-inner ring-2"
                      style={{
                        backgroundColor: "#ffffff80",
                        borderColor: t.palette.primary,
                      }}
                    >
                      <MascotImage
                        size={88}
                        mood="excited"
                        theme={t}
                        className="wobble"
                      />
                    </div>
                    <p
                      className="text-lg font-extrabold drop-shadow-sm"
                      style={{ color: t.palette.primaryDeep }}
                    >
                      {t.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-700/80">
                      {t.tagline}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {[t.palette.primary, t.palette.accent, t.palette.primarySoft].map(
                        (c, i) => (
                          <span
                            key={i}
                            className="h-3 w-3 rounded-full ring-2 ring-white shadow-sm"
                            style={{ backgroundColor: c }}
                            aria-hidden="true"
                          />
                        ),
                      )}
                    </div>
                  </button>

                  {isCurrent && (
                    <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-pink-600 shadow ring-2 ring-pink-200">
                      ✓ {strings.themeActiveBadge}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="border-t-2 border-pink-100 bg-white/80 p-3 text-center">
          <p className="text-xs font-semibold text-pink-900/70">
            {strings.themePickerFooter}
          </p>
        </footer>
      </div>
    </div>
  );
}
