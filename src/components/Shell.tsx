"use client";

import Link from "next/link";
import { LanguageBadge } from "@/components/LanguageBadge";
import { useStrings } from "@/components/LocaleProvider";
import { CloudPuppy } from "./CloudPuppy";
import { ThemeBadge } from "./ThemeBadge";

const nav = [
  { href: "/", key: "navHome" as const, color: "bg-white/90 text-sky-800 ring-2 ring-sky-100 hover:bg-sky-100 shadow-[0_3px_0_#D6F0FF]" },
  { href: "/surah", key: "navSurah" as const, color: "bg-white/90 text-sky-800 ring-2 ring-sky-100 hover:bg-sky-100 shadow-[0_3px_0_#D6F0FF]" },
  { href: "/iqra", key: "navIqra" as const, color: "bg-white/90 text-sky-800 ring-2 ring-sky-100 hover:bg-sky-100 shadow-[0_3px_0_#D6F0FF]" },
  { href: "/games", key: "navGames" as const, color: "bg-white/90 text-sky-800 ring-2 ring-sky-100 hover:bg-sky-100 shadow-[0_3px_0_#D6F0FF]" },
  { href: "/riwayat", key: "navHistory" as const, color: "bg-white/90 text-sky-800 ring-2 ring-sky-100 hover:bg-sky-100 shadow-[0_3px_0_#D6F0FF]" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const strings = useStrings();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-5 px-4 py-6">
      <header
        className="card-cloud p-4"
        style={{ borderColor: "var(--theme-primary-soft)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="floaty shrink-0">
              <CloudPuppy size={60} />
            </span>
            <span>
              <span className="block text-2xl font-extrabold leading-tight text-sky-600">
                {strings.siteTitle}
              </span>
              <span className="block text-xs font-semibold text-sky-400">
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
              className={`flex min-h-12 items-center rounded-full px-4 py-2 text-base font-extrabold transition active:scale-95 ${item.color}`}
            >
              {strings[item.key]}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="rounded-full bg-white/80 p-4 text-center text-sm font-semibold text-sky-700 ring-4 ring-sky-100">
        {strings.footerNote}
      </footer>
    </div>
  );
}
