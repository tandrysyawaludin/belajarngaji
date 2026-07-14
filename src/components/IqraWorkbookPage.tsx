"use client";

import Link from "next/link";
import type { IqraCell, IqraPage, IqraRow } from "@/lib/iqra";
import { useStrings } from "@/components/LocaleProvider";

interface IqraWorkbookPageProps {
  page: IqraPage;
}

function IqraCellText({ cell }: { cell: IqraCell }) {
  if (Array.isArray(cell)) {
    return (
      <span className="flex items-center justify-center gap-3 sm:gap-4" dir="ltr">
        {cell.map((part, index) => (
          <span
            key={`${part}-${index}`}
            className="arabic text-center text-4xl font-bold leading-none sm:text-5xl"
            lang="ar"
            dir="ltr"
            style={{ unicodeBidi: "isolate" }}
          >
            {part}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className="arabic text-center text-4xl font-bold leading-none sm:text-5xl"
      lang="ar"
      dir="ltr"
      style={{ unicodeBidi: "isolate" }}
    >
      {cell}
    </span>
  );
}

function IqraRowContent({ row }: { row: IqraRow }) {
  if ("kind" in row) {
    if (row.kind === "split-note") {
      return (
        <div className="grid min-h-20 grid-cols-[1fr_1.5fr_1fr] items-center gap-3 px-4 py-3 sm:min-h-24 sm:px-8">
          <div className="grid gap-2 text-center">
            {row.left.map((cell, index) => (
              <IqraCellText key={`left-${index}`} cell={cell} />
            ))}
          </div>
          <p className="rounded-2xl border-2 border-stone-700 bg-white/70 px-3 py-2 text-center text-sm font-extrabold text-stone-900 sm:text-base">
            {row.text}
          </p>
          <div className="grid gap-2 text-center">
            {row.right.map((cell, index) => (
              <IqraCellText key={`right-${index}`} cell={cell} />
            ))}
          </div>
        </div>
      );
    }

    if (row.kind === "teaching") {
      return (
        <div
          className={`grid min-h-24 items-center gap-3 px-4 py-3 sm:px-8 ${
            row.target ? "grid-cols-[auto_1.2fr_1fr]" : "grid-cols-[1fr_1.2fr]"
          }`}
        >
          {row.target && (
            <span
              className="arabic rounded-xl border-2 border-stone-700 bg-white/70 px-4 py-2 text-5xl font-black leading-none"
              lang="ar"
              dir="ltr"
              style={{ unicodeBidi: "isolate" }}
            >
              {row.target}
            </span>
          )}
          {!row.target && (
            <div
              className="grid items-center gap-3"
              style={{
                gridTemplateColumns: `repeat(${row.marks.length}, minmax(0, 1fr))`,
              }}
              dir="ltr"
            >
              {row.marks.map((cell, index) => (
                <IqraCellText key={index} cell={cell} />
              ))}
            </div>
          )}
          <p className="rounded-2xl border-2 border-stone-700 bg-white/70 px-3 py-2 text-center text-sm font-extrabold text-stone-950 sm:text-base">
            {row.text}
          </p>
          {row.target && (
            <div
              className="grid items-center gap-3"
              style={{
                gridTemplateColumns: `repeat(${row.marks.length}, minmax(0, 1fr))`,
              }}
              dir="ltr"
            >
              {row.marks.map((cell, index) => (
                <IqraCellText key={index} cell={cell} />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (row.kind === "waqf-table") {
      const pairedEntries = Array.from(
        { length: Math.ceil(row.entries.length / 2) },
        (_, index) => row.entries.slice(index * 2, index * 2 + 2),
      );

      return (
        <div className="grid gap-0 px-4 py-3 sm:px-8">
          {pairedEntries.map((pair, pairIndex) => (
            <div
              key={pairIndex}
              className="grid grid-cols-2 border-2 border-b-0 border-stone-700 last:border-b-2"
            >
              {pair.map((entry, entryIndex) => (
                <div
                  key={entry.sign}
                  className={`grid grid-cols-[0.35fr_1fr] items-center ${
                    entryIndex === 0 ? "border-r-2 border-stone-700" : ""
                  }`}
                >
                  <span className="arabic border-r-2 border-stone-700 py-2 text-center text-4xl font-black">
                    {entry.sign}
                  </span>
                  <span className="px-3 py-2 text-center text-sm font-extrabold sm:text-base">
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex min-h-16 items-center justify-center px-4 py-3 sm:min-h-20 sm:px-8">
        <p
          className={`text-center text-sm font-extrabold sm:text-base ${
            row.tone === "warning"
              ? "rounded-2xl border-2 border-stone-700 bg-white/70 px-4 py-2 text-stone-950"
              : "text-stone-900"
          }`}
        >
          {row.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid min-h-20 items-center gap-8 px-6 py-3 sm:min-h-24 sm:px-10"
      style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
      dir="ltr"
    >
      {row.map((cell, itemIndex) => (
        <IqraCellText key={itemIndex} cell={cell} />
      ))}
    </div>
  );
}

export function IqraWorkbookPage({ page }: IqraWorkbookPageProps) {
  const strings = useStrings();
  const hasHeader = page.showBismillah || page.title || page.subtitle;
  const hasEbtaChecklistHeader =
    page.title === "EBTA" && page.subtitle.includes("•");
  const ebtaChecklistLines = page.subtitle.split("\n");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[2rem] bg-white/85 p-5 shadow-lg ring-4 ring-lime-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/iqra/jilid-${page.jilid}`}
            className="rounded-full bg-lime-100 px-4 py-2 text-sm font-extrabold text-lime-900 transition hover:bg-lime-200 active:scale-95"
          >
            ← {strings.iqraBackToJilid} {page.jilid}
          </Link>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-emerald-700 shadow-sm ring-2 ring-emerald-100">
            {strings.iqraJilid} {page.jilid} · {strings.iqraPage} {page.page}
          </p>
        </div>
      </div>

      <article className="mx-auto w-full max-w-2xl rounded-[2rem] bg-stone-100 p-3 shadow-2xl ring-4 ring-white/80 sm:p-5">
        <div className="relative overflow-hidden rounded-2xl border-[3px] border-stone-800 bg-[#f8f5eb] p-4 text-stone-950 shadow-inner sm:p-6">
          <span className="absolute left-2 top-2 text-2xl font-black text-stone-700" aria-hidden="true">
            +
          </span>
          <span className="absolute right-2 top-2 text-2xl font-black text-stone-700" aria-hidden="true">
            +
          </span>
          <span className="absolute bottom-2 left-2 text-2xl font-black text-stone-700" aria-hidden="true">
            +
          </span>
          <span className="absolute bottom-2 right-2 text-2xl font-black text-stone-700" aria-hidden="true">
            +
          </span>

          {hasHeader && (
            <header className="border-b-2 border-stone-700 pb-4 text-center">
              {page.showBismillah && (
                <p className="arabic text-3xl font-bold leading-none sm:text-4xl" lang="ar">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              )}
              {hasEbtaChecklistHeader ? (
                <div className="mt-1 grid grid-cols-[0.45fr_1fr] items-center gap-4 text-left">
                  <div className="rounded-xl border-2 border-stone-800 px-2 py-4 text-center text-4xl font-black leading-none sm:text-6xl">
                    {page.title}
                  </div>
                  <div className="text-sm font-extrabold leading-snug sm:text-base">
                    {ebtaChecklistLines.map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                  </div>
                </div>
              ) : page.title ? (
                <p
                  className={`${page.showBismillah ? "mt-3" : ""} text-3xl font-extrabold uppercase leading-tight sm:text-5xl`}
                >
                  {page.title}
                </p>
              ) : null}
              {page.subtitle && !hasEbtaChecklistHeader && (
                <p className="mt-1 text-sm font-extrabold uppercase sm:text-base">
                  {page.subtitle}
                </p>
              )}
            </header>
          )}

          <div className="divide-y-2 divide-stone-700">
            {page.rows.map((row, rowIndex) => (
              <IqraRowContent key={rowIndex} row={row} />
            ))}
          </div>
          {page.footerNote && (
            <footer className="border-t-2 border-stone-700 px-4 py-3 text-center text-sm font-extrabold uppercase sm:text-base">
              • {page.footerNote}
            </footer>
          )}
        </div>
      </article>
    </div>
  );
}
