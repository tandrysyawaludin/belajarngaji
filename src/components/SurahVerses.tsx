"use client";

import { useEffect } from "react";
import { writeBookmark } from "@/lib/bookmark";

interface Verse {
  verse: number;
  arabic: string;
  translation?: string;
}

export function SurahVerses({
  surahNumber,
  verses,
}: {
  surahNumber: number;
  verses: Verse[];
}) {
  useEffect(() => {
    writeBookmark({ surahNumber, verse: 1, updatedAt: Date.now() });

    const hash = window.location.hash;
    const match = hash.match(/^#verse-(\d+)$/);
    if (match) {
      document.getElementById(`verse-${match[1]}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    const seen = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.set(entry.target, entry.intersectionRatio);
        }
        let best: { el: Element; ratio: number } | null = null;
        for (const [el, ratio] of seen) {
          if (!best || ratio > best.ratio) best = { el, ratio };
        }
        if (!best || best.ratio <= 0) return;
        const verse = Number.parseInt(best.el.id.replace("verse-", ""), 10);
        if (!Number.isFinite(verse)) return;
        writeBookmark({ surahNumber, verse, updatedAt: Date.now() });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const v of verses) {
      const el = document.getElementById(`verse-${v.verse}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [surahNumber, verses]);

  return (
    <section className="flex flex-col gap-3">
      {verses.map((v) => (
        <article
          key={v.verse}
          id={`verse-${v.verse}`}
          className="print-verse scroll-mt-24 rounded-2xl bg-white/95 p-4 shadow-md ring-2 ring-pink-100"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-500 text-sm font-extrabold text-white shadow">
              {v.verse}
            </span>
            <p className="arabic flex-1 text-right text-pink-900">{v.arabic}</p>
          </div>
          {v.translation && (
            <p className="mt-3 border-t border-pink-100 pt-3 text-base font-semibold leading-relaxed text-slate-700">
              {v.translation}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
