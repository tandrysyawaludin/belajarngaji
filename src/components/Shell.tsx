"use client";

import Link from "next/link";
import { LanguageBadge } from "@/components/LanguageBadge";
import { useStrings } from "@/components/LocaleProvider";
import { ThemedMascot } from "./ThemedMascot";
import { ThemeBadge } from "./ThemeBadge";

const nav = [
  { href: "/", key: "navHome" as const, color: "bg-pink-200 text-pink-900 hover:bg-pink-300" },
  { href: "/surah", key: "navSurah" as const, color: "bg-sky-200 text-sky-900 hover:bg-sky-300" },
  { href: "/iqra", key: "navIqra" as const, color: "bg-lime-200 text-lime-900 hover:bg-lime-300" },
  { href: "/games", key: "navGames" as const, color: "bg-yellow-200 text-yellow-900 hover:bg-yellow-300" },
  { href: "/riwayat", key: "navHistory" as const, color: "bg-rose-200 text-rose-900 hover:bg-rose-300" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const strings = useStrings();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-5 px-4 py-6">
      <header
        className="rounded-[2rem] bg-white/85 p-4 shadow-lg ring-4 backdrop-blur"
        style={{ borderColor: "var(--theme-primary-soft)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="wobble">
              <ThemedMascot size={56} mood="happy" />
            </span>
            <span>
              <span className="block text-2xl font-extrabold leading-tight text-pink-600">
                {strings.siteTitle}
              </span>
              <span className="block text-xs font-semibold text-pink-400">
                {strings.siteTagline}
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageBadge />
            <ThemeBadge />
          </div>
        </div>
        <nav className="mt-3 flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm transition active:scale-95 ${item.color}`}
            >
              {strings[item.key]}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="rounded-2xl bg-pink-50/80 p-4 text-center text-sm font-semibold text-pink-700 ring-2 ring-pink-100">
        {strings.footerNote}
      </footer>
    </div>
  );
}
