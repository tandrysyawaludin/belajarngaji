import Link from "next/link";
import type { IqraPage } from "@/lib/iqra";
import { strings } from "@/lib/strings";

interface IqraJilidMenuProps {
  jilid: number;
  pages: readonly IqraPage[];
}

export function IqraJilidMenu({ jilid, pages }: IqraJilidMenuProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[2rem] bg-white/85 p-6 shadow-lg ring-4 ring-lime-100">
        <Link
          href="/iqra"
          className="inline-flex rounded-full bg-lime-100 px-4 py-2 text-sm font-extrabold text-lime-900 transition hover:bg-lime-200 active:scale-95"
        >
          ← {strings.iqraBackToIqra}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-emerald-800 sm:text-4xl">
          {strings.iqraJilid} {jilid}
        </h1>
        <p className="mt-2 text-base font-semibold text-slate-700">
          Pilih halaman untuk mulai latihan membaca.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.page}
            href={`/iqra/jilid-${jilid}/halaman-${page.page}`}
            className="group rounded-3xl bg-gradient-to-br from-white via-lime-50 to-yellow-100 p-6 shadow-xl ring-4 ring-white/70 transition hover:scale-[1.02] active:scale-95"
          >
            <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-600">
              {strings.iqraJilid} {jilid}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-emerald-800">
              {strings.iqraPage} {page.page}
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-700">
              {page.title || "Latihan membaca huruf hijaiyah."}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
