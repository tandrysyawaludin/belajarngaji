"use client";

import { useStrings } from "@/components/LocaleProvider";
import { CloudPuppy } from "./CloudPuppy";

/** Static Dreamy Sky badge in the header (v2 has a single house theme). */
export function ThemeBadge() {
  const strings = useStrings();
  return (
    <span className="flex min-h-11 items-center gap-2 rounded-full bg-sky-100 py-1.5 pl-1.5 pr-4 text-sm font-extrabold text-sky-800 shadow-[0_3px_0_#D6F0FF] ring-2 ring-white">
      <CloudPuppy size={30} />
      {strings.navTheme}: Dreamy Sky
    </span>
  );
}
