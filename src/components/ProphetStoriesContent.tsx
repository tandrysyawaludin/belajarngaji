"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudPuppy } from "@/components/CloudPuppy";
import { PROPHETS } from "@/data/prophets";

export function ProphetStoriesContent() {
  const [openN, setOpenN] = useState<number | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const [speakingN, setSpeakingN] = useState<number | null>(null);

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingN(null);
  }, []);

  // Never leave a story being read aloud after leaving the page.
  useEffect(() => stopSpeech, [stopSpeech]);

  const listen = useCallback(
    (n: number, name: string, story: string[], lesson: string) => {
      if (!canSpeak) return;
      const synth = window.speechSynthesis;
      if (speakingN === n) {
        stopSpeech();
        return;
      }
      synth.cancel();
      const parts = [`Kisah Nabi ${name}.`, ...story, lesson];
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = "id-ID";
        u.rate = 0.95;
        if (i === parts.length - 1) {
          u.onend = () => setSpeakingN(null);
          u.onerror = () => setSpeakingN(null);
        }
        synth.speak(u);
      });
      setSpeakingN(n);
    },
    [canSpeak, speakingN, stopSpeech],
  );

  const toggle = (n: number) => {
    if (openN !== n) stopSpeech();
    setOpenN((prev) => (prev === n ? null : n));
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-200 via-white to-amber-50 p-6 shadow-lg ring-4 ring-white/70 sm:p-8">
        <div className="dotted absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="floaty">
            <CloudPuppy size={130} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-sky-500">Cerita seru untuk anak saleh ✨</p>
            <h1 className="mt-1 text-3xl font-extrabold text-sky-700 sm:text-4xl">📖 Kisah Para Nabi</h1>
            <p className="mt-2 text-lg font-semibold text-sky-900/80">
              Yuk berkenalan dengan para nabi utusan Allah, dari yang pertama sampai yang terakhir!
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-3 text-center text-base font-extrabold text-white shadow-md ring-4 ring-white/60 sm:text-lg">
        Dari Nabi Adam sampai Nabi Muhammad ﷺ — 25 nabi yang wajib kita kenal
      </div>

      <section className="card-cloud flex items-center gap-4 p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sky-100 text-3xl shadow-inner" aria-hidden="true">
          👆
        </span>
        <p className="text-base font-semibold leading-relaxed text-sky-900/85 sm:text-lg">
          Ketuk nama nabi untuk membaca ceritanya ya! Ada tombol <strong>🔊 Dengarkan Cerita</strong> juga,
          jadi ceritanya bisa didengarkan.
        </p>
      </section>

      <ol className="relative flex flex-col gap-3">
        <span className="absolute top-2 bottom-2 left-[27px] w-1.5 rounded-full bg-sky-200" aria-hidden="true" />
        {PROPHETS.map((p) => {
          const open = openN === p.n;
          return (
            <li key={p.n} className="relative">
              <div className={`overflow-hidden rounded-[1.75rem] shadow-md ring-4 transition ${open ? "bg-white ring-sky-200" : "bg-white/90 ring-white/60"}`}>
                <button
                  type="button"
                  onClick={() => toggle(p.n)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.99] sm:p-5"
                >
                  <span className="z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-extrabold text-white shadow-md ring-4 ring-white">
                    {p.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-extrabold text-sky-800 sm:text-2xl">Nabi {p.name}</span>
                    <span className="block truncate text-sm font-semibold text-sky-900/65 sm:text-base">{p.hook}</span>
                  </span>
                  <span className={`shrink-0 text-2xl transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
                    🔽
                  </span>
                </button>

                {open && (
                  <div className="px-4 pb-5 sm:px-5">
                    <div className="rounded-3xl bg-sky-50 p-4 ring-2 ring-sky-100 sm:p-5">
                      {p.story.map((para, i) => (
                        <p key={i} className="mb-3 text-base font-medium leading-relaxed text-sky-900/90 last:mb-0 sm:text-lg">
                          {para}
                        </p>
                      ))}
                      <p className="mt-4 rounded-2xl bg-amber-100/80 px-4 py-3 text-base font-bold text-amber-800 ring-2 ring-amber-200">
                        🌟 {p.lesson}
                      </p>
                      {canSpeak && (
                        <button
                          type="button"
                          onClick={() => listen(p.n, p.name, p.story, p.lesson)}
                          className="btn-candy btn-candy-pink mt-4 min-h-12 px-6 text-base"
                        >
                          {speakingN === p.n ? "⏸ Sedang dibacakan… ketuk untuk berhenti" : "🔊 Dengarkan Cerita"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-sm font-semibold text-sky-900/60 ring-2 ring-sky-100">
        Sumber bacaan untuk Ayah/Bunda:{" "}
        <a
          href="https://archive.org/details/KisahParaNabiDanRasul"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-sky-600 underline"
        >
          Kisah Para Nabi dan Rasul di archive.org
        </a>
      </p>
    </div>
  );
}
