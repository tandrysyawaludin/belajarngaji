"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Mascot } from "./Mascot";
import { strings } from "@/lib/strings";

const HAPPY_COLORS = ["#ff7eb6", "#ffd166", "#9bd0ff", "#b8f1d2", "#e2d4ff"];

export function fireConfetti() {
  if (typeof window === "undefined") return;
  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      origin: { y: 0.7 },
      colors: HAPPY_COLORS,
      ...opts,
      particleCount: Math.floor(220 * particleRatio),
    });
  };
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export type FeedbackKind = "correct" | "wrong" | null;

export function FeedbackOverlay({
  kind,
  onDone,
}: {
  kind: FeedbackKind;
  onDone?: () => void;
}) {
  useEffect(() => {
    if (!kind) return;
    if (kind === "correct") fireConfetti();
    const timer = window.setTimeout(
      () => onDone?.(),
      kind === "correct" ? 1200 : 1100,
    );
    return () => window.clearTimeout(timer);
  }, [kind, onDone]);

  if (!kind) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {kind === "wrong" && (
        <div className="absolute inset-0 bg-red-500/10" />
      )}
      <div className="pop-in flex flex-col items-center gap-2 rounded-3xl bg-white/95 px-6 py-5 shadow-2xl ring-4 ring-pink-200">
        {kind === "correct" ? (
          <>
            <Mascot size={88} mood="excited" />
            <p className="text-xl font-extrabold text-pink-600">
              {strings.correct}
            </p>
          </>
        ) : (
          <>
            <BombBurst />
            <p className="text-xl font-extrabold text-red-500">
              {strings.wrong}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function BombBurst() {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 bomb-burst rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500" />
      <svg
        viewBox="0 0 96 96"
        className="absolute inset-0 shake"
        aria-hidden="true"
      >
        <circle cx="48" cy="56" r="26" fill="#2c1a3f" />
        <path d="M 56 30 L 64 18 L 72 22" stroke="#2c1a3f" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="72" cy="22" r="5" fill="#ff5e2c" />
        <circle cx="72" cy="22" r="2.5" fill="#ffd166" />
        <path d="M 40 50 q 4 -4 8 0 M 50 50 q 4 -4 8 0" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 42 66 q 6 6 12 0" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
