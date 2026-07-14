"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Surah } from "@/data/surahs";
import { addEntry } from "@/lib/history";
import { playerTheme, type Player } from "@/lib/players";
import type { GameId } from "@/lib/scope";
import { useStrings } from "@/components/LocaleProvider";
import { fireConfetti } from "./Feedback";
import { ThemedMascot } from "./ThemedMascot";

export function MultiplayerResult({
  players,
  gameId,
  scope,
  total,
  unit,
  onRestart,
}: {
  players: Player[];
  gameId: GameId;
  scope: Surah[];
  total: number;
  unit?: string;
  onRestart: () => void;
}) {
  const strings = useStrings();
  const scoreUnit = unit ?? strings.pointsUnit;
  const ranked = useMemo(
    () =>
      players
        .map((player, index) => ({ player, index }))
        .sort((a, b) => b.player.score - a.player.score),
    [players],
  );

  const topScore = ranked[0]?.player.score ?? 0;
  const winners = ranked.filter((r) => r.player.score === topScore);
  const isTie = winners.length > 1;

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    addEntry({
      gameId,
      score: topScore,
      total,
      scopeNumbers: scope.map((s) => s.number),
      answers: ranked.map((r) => ({
        prompt: r.player.name,
        yourAnswer: `${r.player.score} ${scoreUnit}`,
        correctAnswer: `${r.player.score} ${scoreUnit}`,
        correct: r.player.score === topScore,
      })),
    });
  }, [gameId, ranked, scope, topScore, total, scoreUnit]);

  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <article className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-pink-100 via-yellow-100 to-emerald-100 p-8 text-center shadow-lg ring-4 ring-white/60">
      <ThemedMascot size={140} mood="excited" className="wobble" />
      <h2 className="text-3xl font-extrabold text-pink-700">
        {isTie
          ? strings.resultTie
          : `${strings.resultWinner}: ${playerTheme(winners[0].index).token} ${
              winners[0].player.name
            }`}
      </h2>

      <ol className="flex w-full max-w-sm flex-col gap-2">
        {ranked.map((entry, rank) => {
          const theme = playerTheme(entry.index);
          const isWinner = entry.player.score === topScore;
          return (
            <li
              key={entry.player.id}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left font-extrabold shadow-sm ring-2 ${
                isWinner
                  ? "bg-white text-pink-900 ring-emerald-300"
                  : "bg-white/70 text-pink-900/80 ring-pink-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-pink-400">{rank + 1}.</span>
                <span aria-hidden="true">{theme.token}</span>
                {entry.player.name}
                {isWinner && !isTie && <span aria-hidden="true">👑</span>}
              </span>
              <span className="text-emerald-600">
                {entry.player.score} {scoreUnit}
              </span>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-pink-500 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
      >
        🎉 {strings.playAgain}
      </button>
    </article>
  );
}
