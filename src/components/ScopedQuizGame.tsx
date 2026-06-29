"use client";

import { QuizGame } from "./QuizGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108];

export function ScopedQuizGame() {
  return (
    <ScopedGame gameId="kuis" minimum={1} defaultScope={DEFAULT_SCOPE}>
      {(scope, players) => <QuizGame scope={scope} players={players} />}
    </ScopedGame>
  );
}
