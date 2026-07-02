"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import { getSurah } from "@/data/surahs";
import { readBookmark, subscribeBookmark } from "@/lib/bookmark";
import { strings } from "@/lib/strings";

export function ContinueReading() {
  const subscribe = useCallback((cb: () => void) => subscribeBookmark(cb), []);
  const getSnapshot = useCallback(() => readBookmark(), []);
  const getServerSnapshot = useCallback(() => null, []);
  const bookmark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!bookmark) return null;

  const surah = getSurah(bookmark.surahNumber);
  if (!surah) return null;

  return (
    <Link
      href={`/surah/${surah.number}#verse-${bookmark.verse}`}
      className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-sky-300 to-blue-400 p-4 text-white shadow-lg ring-4 ring-white/50 transition hover:scale-[1.01] active:scale-[0.99]"
    >
      <span className="text-4xl" aria-hidden="true">
        🔖
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold uppercase tracking-wide text-white/90">
          {strings.bookmarkContinue}
        </p>
        <p className="text-xl font-extrabold">
          {surah.name} — {strings.bookmarkVerse} {bookmark.verse}
        </p>
        <p className="text-sm font-semibold text-white/90">{surah.meaning}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white/25 px-3 py-1 text-sm font-extrabold">
        {strings.bookmarkOpen}
      </span>
    </Link>
  );
}
