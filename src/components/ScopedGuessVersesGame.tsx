"use client";

import { GuessVersesGame } from "./GuessVersesGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedGuessVersesGame() {
  return (
    <ScopedGame
      gameId="tebak-ayat"
      minimum={1}
      defaultScope={DEFAULT_SCOPE}
    >
      {(scope, players) => <GuessVersesGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
