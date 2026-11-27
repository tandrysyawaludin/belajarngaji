"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudPuppy } from "@/components/CloudPuppy";

export interface GuideStep {
  icon: string;
  text: string;
}

interface GameGuideProps {
  gameId: string;
  title: string;
  steps: GuideStep[];
}

/**
 * "Cara Main" guide for kids aged 5–12: 3 short steps with big icons,
 * plus a read-aloud button (Indonesian TTS) for the youngest players.
 * Auto-opens on the first visit to each game (localStorage flag
 * `belajarngaji:guide:<gameId>`); afterwards it stays available via the
 * floating "❓ Cara Main" pill at the bottom-right.
 */
export function GameGuide({ gameId, title, steps }: GameGuideProps) {
  const [open, setOpen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const storageKey = `belajarngaji:guide:${gameId}`;

  // First visit? Open the guide automatically.
  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    try {
      if (!window.localStorage.getItem(storageKey)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Never leave Awan talking after the component unmounts.
  useEffect(() => stopSpeech, [stopSpeech]);

  // Keep the game still behind the overlay.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open ]);

  const close = useCallback(() => {
    stopSpeech();
    setSpeaking(false);
    setOpen(false);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* private mode — the guide will simply offer itself again next time */
    }
  }, [storageKey, stopSpeech]);

  const reopen = useCallback(() => setOpen(true), []);

  const [speaking, setSpeaking] = useState(false);
  const listen = useCallback(() => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    synth.cancel();
    const parts = [`Cara main ${title}.`, ...steps.map((s) => s.text)];
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = "id-ID";
      u.rate = 0.95;
      if (i === parts.length - 1) { u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false); }
      synth.speak(u);
    });
    setSpeaking(true);
  }, [canSpeak, speaking, steps, title]);

  return (
    <>
      {/* Floating help pill — always there when she gets stuck. */}
      {!open && (
        <button
          type="button"
          onClick={reopen}
          aria-label="Lihat cara main"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-1.5 rounded-full border-[3px] border-white bg-sky-100 px-4 py-2 text-base font-extrabold text-sky-700 shadow-lg transition active:scale-95"
        >
          <span aria-hidden="true">❓</span> Cara Main
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-sky-900/40 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Cara main ${title}`}
        >
          <div
            className="card-cloud relative max-h-full w-full max-w-sm overflow-y-auto rounded-3xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Tutup cara main"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg font-extrabold text-sky-700 transition active:scale-90"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="floaty flex h-28 w-28 items-center justify-center rounded-full bg-sky-100 shadow-inner ring-4 ring-white">
                <CloudPuppy size={92} />
              </span>
              <h2 className="mt-1 text-3xl font-extrabold text-sky-700">Cara Main</h2>
              <p className="text-lg font-bold text-pink-500">{title}</p>
            </div>

            <ol className="mt-4 flex flex-col gap-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-3xl bg-sky-50 p-3">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-3xl shadow-inner"
                  >
                    {s.icon}
                  </span>
                  <span className="text-lg leading-snug font-bold text-sky-900">{s.text}</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex flex-col gap-3">
              {canSpeak && (
                <button
                  type="button"
                  onClick={listen}
                  className="btn-candy btn-candy-pink min-h-14 px-6 text-xl"
                >
                  {speaking ? "⏸ Sedang dibacakan… ketuk untuk berhenti" : "🔊 Dengarkan"}
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="btn-candy btn-candy-pink min-h-14 px-6 text-xl"
              >
                ▶ Yuk, Main!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
