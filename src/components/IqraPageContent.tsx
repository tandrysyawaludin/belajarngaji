"use client";

import Link from "next/link";
import { IQRA_JILIDS } from "@/lib/iqra";
import { useStrings } from "@/components/LocaleProvider";
import { ThemedMascot } from "@/components/ThemedMascot";

export function IqraPageContent() {
  const strings = useStrings();

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-200 via-emerald-100 to-sky-100 p-6 shadow-lg ring-4 ring-white/60 sm:p-8">
        <div className="dotted absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="wobble">
            <ThemedMascot size={120} mood="happy" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-emerald-600">{strings.cardIqraDesc}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-emerald-800 sm:text-4xl">{strings.iqraTitle}</h1>
            <p className="mt-2 text-lg font-semibold text-emerald-950/80">{strings.iqraSubtitle}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IQRA_JILIDS.map((jilid) => (
          <Link
            key={jilid.id}
            href={jilid.available ? jilid.href : "#"}
            aria-disabled={!jilid.available}
            className={`relative overflow-hidden rounded-3xl p-5 shadow-lg ring-4 ring-white/60 transition ${
              jilid.available
                ? "bg-gradient-to-br from-lime-300 to-emerald-400 hover:scale-[1.02] active:scale-95"
                : "cursor-not-allowed bg-slate-200 opacity-70"
            }`}
          >
            <h2 className="text-2xl font-extrabold text-white drop-shadow">
              {strings.iqraJilid} {jilid.id}
            </h2>
            <p className="mt-1 font-semibold text-white/90">{jilid.title}</p>
            {!jilid.available && (
              <span className="mt-2 inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-slate-600">
                {strings.iqraComingSoon}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
