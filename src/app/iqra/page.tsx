import Link from "next/link";
import { IQRA_JILIDS } from "@/lib/iqra";
import { strings } from "@/lib/strings";
import { ThemedMascot } from "@/components/ThemedMascot";

export default function IqraPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-200 via-emerald-100 to-sky-100 p-6 shadow-lg ring-4 ring-white/60 sm:p-8">
        <div className="dotted absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="wobble">
            <ThemedMascot size={120} mood="happy" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-emerald-600">
              {strings.cardIqraDesc}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-emerald-800 sm:text-4xl">
              {strings.iqraTitle}
            </h1>
            <p className="mt-2 text-lg font-semibold text-emerald-950/80">
              {strings.iqraSubtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IQRA_JILIDS.map((jilid) => {
          const card = (
            <div className="group relative min-h-40 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-lime-50 to-emerald-100 p-6 shadow-xl ring-4 ring-white/70 transition">
              <div className="dotted absolute inset-0 opacity-35" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-600">
                    {strings.iqraJilid}
                  </p>
                  <h2 className="mt-1 text-4xl font-extrabold text-emerald-800">
                    {jilid.id}
                  </h2>
                </div>
                <p className="rounded-full bg-white/80 px-4 py-2 text-center text-sm font-extrabold text-emerald-800 shadow-sm ring-2 ring-emerald-100">
                  {jilid.available ? "Mulai belajar" : strings.iqraComingSoon}
                </p>
              </div>
            </div>
          );

          return jilid.available ? (
            <Link
              key={jilid.id}
              href={jilid.href}
              className="transition hover:scale-[1.02] active:scale-95"
            >
              {card}
            </Link>
          ) : (
            <div key={jilid.id} className="cursor-not-allowed opacity-60">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
