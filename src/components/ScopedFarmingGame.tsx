"use client";

import { FarmingGame } from "./FarmingGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedFarmingGame() {
  return (
    <ScopedGame gameId="berkebun" minimum={4} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <FarmingGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
