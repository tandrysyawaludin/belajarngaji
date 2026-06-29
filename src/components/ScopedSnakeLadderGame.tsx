"use client";

import { SnakeLadderGame } from "./SnakeLadderGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedSnakeLadderGame() {
  return (
    <ScopedGame gameId="ular-tangga" minimum={4} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <SnakeLadderGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
