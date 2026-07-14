"use client";

import { useStrings } from "@/components/LocaleProvider";

export function PrintButton({ className = "" }: { className?: string }) {
  const strings = useStrings();

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`print-hide inline-flex items-center gap-2 border-2 border-current px-4 py-2 text-sm font-extrabold shadow-sm transition hover:brightness-95 active:scale-95 ${className}`}
      title={strings.printPdfHint}
    >
      <span aria-hidden="true">🖨️</span>
      {strings.printPdf}
    </button>
  );
}
