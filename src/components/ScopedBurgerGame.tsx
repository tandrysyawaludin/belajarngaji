"use client";

import { BurgerGame } from "./BurgerGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108, 107, 106, 105];

export function ScopedBurgerGame() {
  return (
    <ScopedGame gameId="tukang-burger" minimum={4} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <BurgerGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
