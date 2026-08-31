"use client";

import { useEffect, useRef } from "react";
import { useStrings } from "@/components/LocaleProvider";
import type { SnakeLadderQuestion } from "@/lib/snake-ladder";

export function BoardQuestionModal({
  question,
  playerName,
  onChoose,
}: {
  question: SnakeLadderQuestion;
  playerName: string | null;
  onChoose: (option: string) => void;
}) {
  const strings = useStrings();
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousFocus =
      typeof document !== "undefined" ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4 backdrop-blur-sm">
      <article
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="pop-in max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white/95 p-5 shadow-2xl ring-4 ring-pink-100"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-pink-500">
          {playerName
            ? `${strings.turnLabel}: ${playerName}`
            : strings.snakeAnswerFirstShort}
        </p>
        <h3 className="mt-2 text-xl font-extrabold text-pink-800">
          {question.prompt}
        </h3>
        <p className="arabic mt-1 text-pink-600">{question.surah.arabic}</p>
        <div className="mt-5 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              className="bg-white px-5 py-4 text-left text-base font-bold text-pink-900 shadow-sm ring-2 ring-pink-100 transition hover:bg-pink-50 hover:ring-pink-200 active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}
