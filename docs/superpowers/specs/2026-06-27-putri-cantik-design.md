# Putri Cantik Game Design

Date: 2026-06-27

## Goal

Add a new Quran learning game named **Putri Cantik**. The game lets a child dress a pixel princess by answering Quran questions from a chosen surah scope.

The experience should feel playful and low-pressure: the child can keep trying wardrobe items in free play, and every successful outfit change is tied to a correct learning answer.

## Approved Decisions

- Question mode: mixed questions.
- Art direction: original pixel dress-up art created in the app.
- Session model: free play, no forced ending.
- Replacement behavior: choosing a new item for an occupied slot asks a new question; correct answer replaces the old item.
- Asset/license policy: use repo-owned original pixel art for all game-critical princess and wardrobe visuals. CC0/public-domain assets are allowed only as non-critical visual references or supporting assets after license verification.
- Outfit persistence: save the current outfit locally in the browser.

## User Flow

1. The child opens `/putri-cantik`.
2. The game uses the existing surah scope picker flow.
3. After the child confirms a scope, the play screen appears.
4. The left side shows a pixel princess wearing a basic shirt and basic long pants.
5. The right side shows wardrobe options grouped by slot, such as hat, top/dress, bottom, shoes, and accessory.
6. The child selects a wardrobe item.
7. The game asks one mixed Quran question from the selected scope.
8. If the answer is correct, the selected item is equipped. If another item was already in that slot, it is replaced.
9. If the answer is wrong, the game shows a friendly incorrect prompt and the outfit does not change.
10. The child can continue choosing and replacing wardrobe items indefinitely.
11. The current outfit is saved locally and restored on the next visit.

## Questions

Questions are generated from the active surah scope.

Mixed mode includes:

- Meaning question: "Apa arti dari surah {name}?"
- Verse-count question: "Berapa jumlah ayat dari surah {name}?"

Each question is multiple choice. Meaning questions can reuse the existing quiz pattern. Verse-count questions can reuse the existing guess pattern. Distractors should come from valid surah data and avoid duplicate answer options.

## Game State

The game tracks:

- Active surah scope.
- Current outfit by slot.
- Pending wardrobe item, if a question is open.
- Current question and options.
- Current visit counters: correct attempts and total attempts.
- Feedback state for correct and wrong answers.

Outfit persistence uses localStorage with a dedicated key, separate from existing scope and history storage. Invalid or unknown item IDs should be ignored when restoring.

## Wardrobe Model

Each wardrobe item has:

- `id`
- `slot`
- `label`
- `description`
- `palette` or visual style data needed by the pixel renderer
- `sortOrder`

Initial slots:

- `base`: princess body, hair, basic shirt, and long pants
- `hat`: crown, flower hat, ribbon
- `top`: dress, blouse, royal top
- `bottom`: skirt, fancy pants
- `shoes`: boots, slippers
- `accessory`: necklace, wand, bag

The base outfit is always visible. Equippable wardrobe layers are drawn above the base in a stable order so replacements are predictable.

## Visual Design

Use original pixel art built from small CSS/SVG-like blocks in React components. The style should match the app's pastel/kawaii feel while staying visibly pixel-based.

Recommended layout:

- Mobile: princess preview first, wardrobe below.
- Desktop/tablet: princess preview on the left, wardrobe panel on the right.
- Question modal/card appears after selecting an item.

The princess should start modest and simple: basic shirt and long pants. Wardrobe items should be cheerful and child-friendly.

## Integration Points

Add:

- `/putri-cantik` route.
- `PutriCantikGame` client component.
- `ScopedPutriCantikGame` wrapper using `ScopedGame`.
- Pixel princess/wardrobe components.
- Local outfit storage helper.
- New `GameId` value in `src/lib/scope.ts`.
- Strings for navigation, home card, prompts, and feedback.
- Home card on `/`.
- Header navigation entry in `src/components/Shell.tsx`.

The first version will not write free-play attempts to global history. The game should show current visit counters in the game UI instead.

## Error Handling

- If scope is empty or not ready, rely on `ScopedGame` to show the picker.
- If saved outfit contains unknown item IDs, discard those entries.
- If a selected item is unavailable, close the pending question and show a friendly fallback message.
- If the child answers incorrectly, show a friendly "belum benar" prompt and keep the outfit unchanged.

## Testing Plan

Add focused automated tests when the repo has a matching test harness. If no test harness exists, verify these behaviors manually and keep the game logic small enough to inspect:

- Mixed question generation creates both meaning and verse-count question shapes.
- Multiple-choice options include the correct answer and no duplicates.
- Correct answer equips the pending item.
- Wrong answer does not equip the pending item.
- Replacing an occupied slot requires a correct answer and swaps the item.
- Saved outfit restores from localStorage and ignores unknown item IDs.

Manual verification:

- Run lint and production build.
- Open `/putri-cantik`.
- Pick a surah scope.
- Try correct and wrong answers.
- Confirm the princess outfit changes only on correct answers.
- Refresh the page and confirm the outfit persists.
- Check mobile and desktop layout.

## Out Of Scope For First Version

- Downloading or bundling third-party wardrobe art.
- Animated walking or pose changes.
- A forced final score screen.
- Global history entries for every free-play attempt.
- Audio feedback.
