"use client";

import { playerTheme, type Player } from "@/lib/players";
import { useStrings } from "@/components/LocaleProvider";

export function TurnBanner({
  players,
  currentIndex,
  scoreUnit,
}: {
  players: Player[];
  currentIndex: number;
  scoreUnit?: string;
}) {
  const strings = useStrings();
  const unit = scoreUnit ?? strings.scoreLabel;
  const current = players[currentIndex];
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/90 p-3 shadow ring-2 ring-pink-100">
      <p className="text-center text-base font-extrabold text-pink-700">
        {strings.turnLabel}:{" "}
        <span className="text-pink-900">
          {playerTheme(currentIndex).token} {current?.name}
        </span>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {players.map((player, i) => {
          const theme = playerTheme(i);
          const isActive = i === currentIndex;
          return (
            <span
              key={player.id}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold shadow-sm ring-2 ${
                isActive
                  ? "bg-red-500 text-white ring-red-300"
                  : "bg-white text-pink-900 ring-pink-100"
              }`}
            >
              <span aria-hidden="true">{theme.token}</span>
              {player.name}
              <span
                className={`ml-0.5 rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/30" : "bg-pink-100"
                }`}
              >
                {player.score}
              </span>
            </span>
          );
        })}
      </div>
      <span className="sr-only">{unit}</span>
    </div>
  );
}
