"use client";

import { useEffect, useMemo, useState } from "react";
import { type Surah } from "@/data/surahs";
import { strings } from "@/lib/strings";
import { sampleUnique, shuffle } from "@/lib/random";
import { FeedbackOverlay, type FeedbackKind, fireConfetti } from "./Feedback";
import { Mascot } from "./Mascot";

const MAX_PAIRS_PER_ROUND = 5;

interface Round {
  names: Surah[];
  shuffledMeanings: Surah[];
}

function buildRound(scope: Surah[]): Round {
  // Several surahs share the same meaning (e.g. "Hari Kiamat", "Terbelah").
  // Deduplicate within the kid's scope so each round has unambiguous matches.
  const byMeaning = new Map<string, Surah>();
  for (const s of scope) {
    if (!byMeaning.has(s.meaning)) byMeaning.set(s.meaning, s);
  }
  const pool = Array.from(byMeaning.values());
  const count = Math.min(MAX_PAIRS_PER_ROUND, pool.length);
  const names = sampleUnique(pool, count);
  return { names, shuffledMeanings: shuffle(names) };
}

const NAME_COLORS = [
  "bg-pink-100 text-pink-900 ring-pink-200 hover:bg-pink-200",
  "bg-sky-100 text-sky-900 ring-sky-200 hover:bg-sky-200",
  "bg-yellow-100 text-yellow-900 ring-yellow-200 hover:bg-yellow-200",
  "bg-emerald-100 text-emerald-900 ring-emerald-200 hover:bg-emerald-200",
  "bg-violet-100 text-violet-900 ring-violet-200 hover:bg-violet-200",
];

export function MatchingGame({ scope }: { scope: Surah[] }) {
  const [round, setRound] = useState<Round>(() => buildRound(scope));
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selectedName, setSelectedName] = useState<number | null>(null);
  const [wrongPair, setWrongPair] = useState<{ name: number; meaning: number } | null>(
    null,
  );
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [streak, setStreak] = useState(0);

  const complete = matched.size === round.names.length;

  useEffect(() => {
    if (complete) fireConfetti();
  }, [complete]);

  const handleNamePick = (number: number) => {
    if (matched.has(number) || wrongPair) return;
    setSelectedName(number);
  };

  const handleMeaningPick = (meaningSurah: Surah) => {
    if (selectedName === null || matched.has(meaningSurah.number) || wrongPair) return;
    if (meaningSurah.number === selectedName) {
      setMatched((prev) => new Set(prev).add(meaningSurah.number));
      setSelectedName(null);
      setStreak((s) => s + 1);
      setFeedback("correct");
    } else {
      setWrongPair({ name: selectedName, meaning: meaningSurah.number });
      setFeedback("wrong");
      setStreak(0);
      window.setTimeout(() => {
        setWrongPair(null);
        setSelectedName(null);
      }, 750);
    }
  };

  const newRound = () => {
    setRound(buildRound(scope));
    setMatched(new Set());
    setSelectedName(null);
    setWrongPair(null);
    setFeedback(null);
    setStreak(0);
  };

  const palette = useMemo(
    () =>
      Object.fromEntries(
        round.names.map((s, idx) => [s.number, NAME_COLORS[idx % NAME_COLORS.length]]),
      ) as Record<number, string>,
    [round],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/85 p-3 px-4 shadow ring-2 ring-pink-100">
        <p className="text-sm font-bold text-pink-800">
          Cocok:{" "}
          <span className="text-emerald-600">{matched.size}</span> /{" "}
          {round.names.length} • Streak:{" "}
          <span className="text-pink-600">{streak}</span> ⚡
        </p>
        <button
          type="button"
          onClick={newRound}
          className="rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700 ring-2 ring-pink-200 transition hover:bg-pink-200"
        >
          🔄 Soal Baru
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <h3 className="text-center text-sm font-extrabold uppercase tracking-wider text-pink-500">
            Nama Surah
          </h3>
          {round.names.map((s) => {
            const isMatched = matched.has(s.number);
            const isSelected = selectedName === s.number;
            const isWrong = wrongPair?.name === s.number;
            const base =
              "flex items-center justify-between rounded-2xl px-4 py-3 text-left font-extrabold shadow-sm ring-2 transition active:scale-[0.98]";
            let style = palette[s.number];
            if (isMatched) style = "bg-emerald-200 text-emerald-900 ring-emerald-300 opacity-90";
            else if (isSelected) style = "bg-pink-300 text-pink-900 ring-pink-400 ring-4 pop-in";
            else if (isWrong) style = "bg-red-200 text-red-900 ring-red-300 shake";
            return (
              <button
                key={s.number}
                type="button"
                disabled={isMatched}
                onClick={() => handleNamePick(s.number)}
                className={`${base} ${style}`}
              >
                <span>{s.name}</span>
                <span className="arabic text-base">{s.arabic}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-center text-sm font-extrabold uppercase tracking-wider text-pink-500">
            Arti
          </h3>
          {round.shuffledMeanings.map((s) => {
            const isMatched = matched.has(s.number);
            const isWrong = wrongPair?.meaning === s.number;
            const base =
              "rounded-2xl px-4 py-3 text-left font-extrabold shadow-sm ring-2 transition active:scale-[0.98]";
            let style =
              "bg-white text-pink-900 ring-pink-100 hover:bg-pink-50 hover:ring-pink-200";
            if (isMatched) style = "bg-emerald-200 text-emerald-900 ring-emerald-300 opacity-90";
            else if (isWrong) style = "bg-red-200 text-red-900 ring-red-300 shake";
            return (
              <button
                key={s.number}
                type="button"
                disabled={isMatched}
                onClick={() => handleMeaningPick(s)}
                className={`${base} ${style}`}
              >
                {s.meaning}
              </button>
            );
          })}
        </div>
      </div>

      {complete && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-emerald-100 via-yellow-100 to-pink-100 p-6 text-center shadow-lg ring-4 ring-white/60 pop-in">
          <Mascot size={120} mood="excited" className="wobble" />
          <h2 className="text-2xl font-extrabold text-emerald-700">
            🎉 {strings.perfectScore}
          </h2>
          <button
            type="button"
            onClick={newRound}
            className="rounded-full bg-pink-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
          >
            🎮 {strings.playAgain}
          </button>
        </div>
      )}

      <FeedbackOverlay kind={feedback} onDone={() => setFeedback(null)} />
    </div>
  );
}
