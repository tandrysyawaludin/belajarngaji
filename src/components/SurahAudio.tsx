"use client";

import { useRef, useState } from "react";
import { useStrings } from "@/components/LocaleProvider";

export function SurahAudio({ src }: { src: string }) {
  const strings = useStrings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => setError(true));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-extrabold text-pink-700 shadow-md ring-2 ring-pink-200 transition active:scale-95 hover:bg-pink-50"
      >
        <span className="text-lg">{playing ? "⏸️" : "▶️"}</span>
        {strings.listenLabel}
      </button>
      {error && (
        <p className="text-xs font-bold text-red-500">
          Audio belum bisa diputar, coba lagi nanti.
        </p>
      )}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
