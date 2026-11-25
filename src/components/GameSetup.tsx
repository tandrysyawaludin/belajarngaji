"use client";

import { useState } from "react";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  defaultPlayerName,
  makePlayers,
  playerTheme,
  type Player,
} from "@/lib/players";
import { useStrings } from "@/components/LocaleProvider";

export function GameSetup({ onStart }: { onStart: (players: Player[]) => void }) {
  const strings = useStrings();
  const [mode, setMode] = useState<"solo" | "multi">("solo");
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: MAX_PLAYERS }, (_, i) => defaultPlayerName(i)),
  );

  const setName = (index: number, value: string) =>
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));

  const start = () => {
    if (mode === "solo") {
      onStart(makePlayers(1));
      return;
    }
    onStart(makePlayers(count, names.slice(0, count)));
  };

  return (
    <div className="rounded-3xl bg-white/95 p-6 shadow-lg ring-4 ring-sky-100">
      <h2 className="text-center text-2xl font-extrabold text-sky-700">
        {strings.setupTitle}
      </h2>
      <p className="mt-1 text-center text-sm font-semibold text-sky-900/70">
        {strings.setupSubtitle}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ModeButton
          active={mode === "solo"}
          emoji="🙋"
          label={strings.setupSolo}
          onClick={() => setMode("solo")}
        />
        <ModeButton
          active={mode === "multi"}
          emoji="👨‍👩‍👧‍👦"
          label={strings.setupMulti}
          onClick={() => setMode("multi")}
        />
      </div>

      {mode === "multi" && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-sky-50/70 p-4 ring-2 ring-sky-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-sky-800">
              {strings.setupPlayerCount}
            </span>
            <div className="flex items-center gap-3">
              <StepButton
                label="−"
                disabled={count <= MIN_PLAYERS}
                onClick={() => setCount((c) => Math.max(MIN_PLAYERS, c - 1))}
              />
              <span className="w-6 text-center text-xl font-extrabold text-sky-700">
                {count}
              </span>
              <StepButton
                label="+"
                disabled={count >= MAX_PLAYERS}
                onClick={() => setCount((c) => Math.min(MAX_PLAYERS, c + 1))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {Array.from({ length: count }, (_, i) => (
              <label key={i} className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {playerTheme(i).token}
                </span>
                <input
                  type="text"
                  value={names[i]}
                  maxLength={16}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={defaultPlayerName(i)}
                  className="min-w-0 flex-1 rounded-xl border-2 border-sky-200 bg-white px-3 py-2 text-sm font-bold text-sky-900 outline-none focus:border-sky-400"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={start}
        className="mt-6 w-full rounded-full bg-sky-500 px-6 py-3 text-lg font-extrabold text-white shadow-md transition hover:bg-sky-600 active:scale-95"
      >
        🎮 {strings.setupStart}
      </button>
    </div>
  );
}

function ModeButton({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-base font-extrabold shadow-sm ring-2 transition active:scale-95 ${
        active
          ? "bg-sky-500 text-white ring-sky-300"
          : "bg-white text-sky-800 ring-sky-200 hover:bg-sky-50"
      }`}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      {label}
    </button>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-xl font-extrabold text-white shadow transition hover:bg-sky-600 active:scale-90 disabled:cursor-not-allowed disabled:bg-sky-200"
    >
      {label}
    </button>
  );
}
