"use client";

import { MatchingGame } from "./MatchingGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedMatchingGame() {
  return (
    <ScopedGame gameId="cocokkan" minimum={2} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <MatchingGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
