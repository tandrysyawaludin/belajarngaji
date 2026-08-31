"use client";

import { ScopedGame } from "./ScopedGame";
import { TicTacToeGame } from "./TicTacToeGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedTicTacToeGame() {
  return (
    <ScopedGame gameId="tic-tac-toe" minimum={4} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <TicTacToeGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
