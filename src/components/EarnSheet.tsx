"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { makeQuestion, type KidQ } from "@/components/KidQuestion";

/**
 * Answer-first bottom sheet (v2 core mechanic):
 * the child answers a gentle question FIRST, then earns the reward
 * (tokens / blocks) that lets her do an action in the game.
 * Wrong answer = shake + encouragement, never a punishment or a lockout.
 */
export function EarnSheet({
  open,
  rewardLabel,
  onEarn,
  onClose,
}: {
  open: boolean;
  /** e.g. "+1 Token Bintang" or "+5 Blok" */
  rewardLabel: string;
  onEarn: () => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState<KidQ | null>(null);
  const [wrong, setWrong] = useState(false);
  const [right, setRight] = useState(false);

  useEffect(() => {
    if (open) {
      setQ(makeQuestion());
      setWrong(false);
      setRight(false);
    }
  }, [open ]);

  if (!open || !q) return null;

  const pick = (c: string) => {
    if (right) return;
    if (c === q.answer) {
      setRight(true);
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#7EC8F7", "#FFB7D5", "#FFD66E", "#ffffff"],
      });
      window.setTimeout(() => {
        onEarn();
        onClose();
      }, 650);
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-sky-900/40 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Jawab dulu yuk"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`card-cloud w-full max-w-md p-5 pb-7 sm:m-4 ${wrong ? "shake-x" : "pop-place"}`}
        style={{ borderRadius: "2rem 2rem 0 0" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-sky-200 sm:hidden" aria-hidden="true" />
        <p className="text-center text-sm font-extrabold uppercase tracking-widest text-sky-500">
          Jawab dulu yuk!
        </p>
        <p className="mt-1 text-center text-base font-bold text-pink-400">
          Benar = dapat {rewardLabel}
        </p>
        <p className="mt-3 text-center text-xl font-extrabold leading-snug text-sky-950">
          {q.prompt}
        </p>
        {q.arabic && (
          <p className="arabic mt-1 text-center text-sky-900">{q.arabic}</p>
        )}
        <div className="mt-4 grid gap-3">
          {q.choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              className={`min-h-14 rounded-full border-[3px] border-white px-5 py-3 text-lg font-extrabold shadow-[0_4px_0_#D6F0FF] transition active:scale-95 ${
                right && c === q.answer
                  ? "bg-emerald-400 text-white shadow-[0_4px_0_#A7F3D0]"
                  : "bg-sky-100 text-sky-900 hover:bg-sky-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {wrong && (
          <p className="mt-3 text-center text-base font-bold text-pink-500">
            Hampir! Kamu pasti bisa, coba lagi ya
          </p>
        )}
        {right && (
          <p className="mt-3 text-center text-lg font-extrabold text-emerald-600">
            Masya Allah, benar! {rewardLabel} untukmu
          </p>
        )}
        <button type="button" onClick={onClose} className="btn-candy-white mt-4 w-full text-base">
          Nanti saja
        </button>
      </div>
    </div>
  );
}

/** Sticky in-game header: token balance + the big "answer to earn" button. */
export function TokenBar({
  balance,
  unit,
  earnLabel,
  onEarnClick,
}: {
  balance: number;
  unit: string;
  earnLabel: string;
  onEarnClick: () => void;
}) {
  return (
    <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-2">
      <span className="chip-token" aria-live="polite">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
            fill="#FFD66E"
            stroke="#F5B81E"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {balance} {unit}
      </span>
      <button type="button" onClick={onEarnClick} className="btn-candy btn-candy-pink flex-1 text-base sm:flex-none">
        {earnLabel}
      </button>
    </div>
  );
}
