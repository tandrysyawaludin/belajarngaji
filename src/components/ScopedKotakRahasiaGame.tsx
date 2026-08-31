"use client";

import { KotakRahasiaGame } from "./KotakRahasiaGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedKotakRahasiaGame() {
  return (
    <ScopedGame gameId="kotak-rahasia" minimum={4} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <KotakRahasiaGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
