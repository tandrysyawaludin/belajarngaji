"use client";

import { JUZ30_NUMBERS } from "@/data/juz30";
import { useStrings } from "@/components/LocaleProvider";
import { SambungAyatGame } from "./SambungAyatGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedSambungAyatGame() {
  const strings = useStrings();
  return (
    <ScopedGame
      gameId="sambung"
      minimum={1}
      availableNumbers={JUZ30_NUMBERS}
      restrictedNote={strings.scopeRestricted}
      defaultScope={DEFAULT_SCOPE}
    >
      {(scope, players) => <SambungAyatGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
