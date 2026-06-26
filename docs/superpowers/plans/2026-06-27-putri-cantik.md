# Putri Cantik Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/putri-cantik` free-play dress-up game where children answer mixed Quran questions to equip or replace pixel wardrobe items on a princess.

**Architecture:** Reuse the existing scoped-game flow for surah selection, then keep Putri Cantik-specific logic in small focused modules under `src/lib/putri-cantik.ts` and `src/components/PutriCantikGame.tsx`. Pixel art is original repo-owned React/CSS art, not downloaded assets. Outfit state persists through a dedicated localStorage helper and does not write noisy free-play attempts to global history.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript strict mode, Tailwind CSS 4, existing `ScopedGame`, `SURAHS`, `strings`, and `localStorage` patterns.

---

## File Structure

- Create `src/lib/putri-cantik.ts`
  - Owns wardrobe item definitions, outfit types, question generation, answer checking, and localStorage helpers.
- Create `src/components/PutriCantikGame.tsx`
  - Client gameplay component: princess preview, wardrobe panel, question card, feedback, counters, and reset outfit action.
- Create `src/components/ScopedPutriCantikGame.tsx`
  - Thin wrapper around `ScopedGame` with a default scope.
- Create `src/app/putri-cantik/page.tsx`
  - Page shell and metadata for the new game.
- Modify `src/lib/scope.ts`
  - Add `putri-cantik` as a `GameId`.
- Modify `src/lib/strings.ts`
  - Add navigation, home card, prompt, and feedback strings.
- Modify `src/components/Shell.tsx`
  - Add header nav entry.
- Modify `src/app/page.tsx`
  - Add home card.
- Modify `README.md`
  - Document the new game and original pixel-art policy.

There is currently no automated test runner in `package.json`, so this plan uses type/lint/build verification plus manual browser checks. Keep `src/lib/putri-cantik.ts` pure where possible so tests can be added later without refactoring.

---

### Task 1: Add Putri Cantik Domain Model And Pure Logic

**Files:**
- Create: `src/lib/putri-cantik.ts`

- [ ] **Step 1: Create wardrobe and outfit types**

Create `src/lib/putri-cantik.ts` with these exported types and constants:

```ts
import { SURAHS, type Surah } from "@/data/surahs";
import { sampleUnique, shuffle } from "@/lib/random";

export type PutriWardrobeSlot = "hat" | "top" | "bottom" | "shoes" | "accessory";

export interface PutriWardrobeItem {
  id: string;
  slot: PutriWardrobeSlot;
  label: string;
  description: string;
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  sortOrder: number;
}

export type PutriOutfit = Partial<Record<PutriWardrobeSlot, string>>;

export type PutriQuestion =
  | {
      kind: "meaning";
      prompt: string;
      surah: Surah;
      options: string[];
      correct: string;
    }
  | {
      kind: "verses";
      prompt: string;
      surah: Surah;
      options: string[];
      correct: string;
    };

export const PUTRI_WARDROBE: readonly PutriWardrobeItem[] = [
  {
    id: "crown-gold",
    slot: "hat",
    label: "Mahkota Emas",
    description: "Mahkota pixel berwarna emas.",
    colors: { primary: "#facc15", secondary: "#fef08a", accent: "#f472b6" },
    sortOrder: 10,
  },
  {
    id: "ribbon-pink",
    slot: "hat",
    label: "Pita Pink",
    description: "Pita lucu untuk rambut putri.",
    colors: { primary: "#fb7185", secondary: "#fecdd3" },
    sortOrder: 20,
  },
  {
    id: "dress-rose",
    slot: "top",
    label: "Gaun Mawar",
    description: "Gaun pixel warna mawar.",
    colors: { primary: "#f472b6", secondary: "#fbcfe8", accent: "#be185d" },
    sortOrder: 30,
  },
  {
    id: "royal-top-blue",
    slot: "top",
    label: "Baju Biru Kerajaan",
    description: "Atasan biru yang rapi dan cerah.",
    colors: { primary: "#38bdf8", secondary: "#bae6fd", accent: "#0369a1" },
    sortOrder: 40,
  },
  {
    id: "skirt-lilac",
    slot: "bottom",
    label: "Rok Ungu",
    description: "Rok pixel ungu pastel.",
    colors: { primary: "#a78bfa", secondary: "#ddd6fe" },
    sortOrder: 50,
  },
  {
    id: "pants-mint",
    slot: "bottom",
    label: "Celana Mint",
    description: "Celana panjang warna mint.",
    colors: { primary: "#34d399", secondary: "#bbf7d0" },
    sortOrder: 60,
  },
  {
    id: "shoes-gold",
    slot: "shoes",
    label: "Sepatu Emas",
    description: "Sepatu kecil warna emas.",
    colors: { primary: "#f59e0b", secondary: "#fde68a" },
    sortOrder: 70,
  },
  {
    id: "shoes-pink",
    slot: "shoes",
    label: "Sepatu Pink",
    description: "Sepatu pink yang manis.",
    colors: { primary: "#fb7185", secondary: "#fecdd3" },
    sortOrder: 80,
  },
  {
    id: "wand-star",
    slot: "accessory",
    label: "Tongkat Bintang",
    description: "Tongkat kecil berbentuk bintang.",
    colors: { primary: "#fef3c7", secondary: "#facc15", accent: "#f472b6" },
    sortOrder: 90,
  },
  {
    id: "necklace-emerald",
    slot: "accessory",
    label: "Kalung Hijau",
    description: "Kalung pixel hijau zamrud.",
    colors: { primary: "#10b981", secondary: "#a7f3d0" },
    sortOrder: 100,
  },
] as const;

export const PUTRI_WARDROBE_SLOTS: readonly PutriWardrobeSlot[] = [
  "hat",
  "top",
  "bottom",
  "shoes",
  "accessory",
] as const;

export const PUTRI_SLOT_LABELS: Record<PutriWardrobeSlot, string> = {
  hat: "Topi & Mahkota",
  top: "Baju & Gaun",
  bottom: "Rok & Celana",
  shoes: "Sepatu",
  accessory: "Aksesori",
};
```

- [ ] **Step 2: Add lookup and outfit sanitizing helpers**

Append these helpers to the same file:

```ts
export function findPutriItem(itemId: string): PutriWardrobeItem | null {
  return PUTRI_WARDROBE.find((item) => item.id === itemId) ?? null;
}

export function putriItemsBySlot(slot: PutriWardrobeSlot): PutriWardrobeItem[] {
  return PUTRI_WARDROBE.filter((item) => item.slot === slot).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function sanitizePutriOutfit(value: unknown): PutriOutfit {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const outfit: PutriOutfit = {};

  for (const slot of PUTRI_WARDROBE_SLOTS) {
    const itemId = record[slot];
    if (typeof itemId !== "string") continue;
    const item = findPutriItem(itemId);
    if (item && item.slot === slot) {
      outfit[slot] = item.id;
    }
  }

  return outfit;
}

export function equipPutriItem(outfit: PutriOutfit, item: PutriWardrobeItem): PutriOutfit {
  return {
    ...outfit,
    [item.slot]: item.id,
  };
}
```

- [ ] **Step 3: Add mixed question generation**

Append:

```ts
const OPTIONS_PER_QUESTION = 4;

function buildMeaningQuestion(scope: Surah[]): PutriQuestion {
  const surah = scope[Math.floor(Math.random() * scope.length)];
  const distractors = sampleUnique(
    SURAHS.filter((s) => s.meaning !== surah.meaning).map((s) => s.meaning),
    OPTIONS_PER_QUESTION - 1,
  );
  const options = shuffle(Array.from(new Set([surah.meaning, ...distractors]))).slice(
    0,
    OPTIONS_PER_QUESTION,
  );

  if (!options.includes(surah.meaning)) {
    options[0] = surah.meaning;
  }

  return {
    kind: "meaning",
    prompt: `Apa arti dari surah ${surah.name}?`,
    surah,
    options: shuffle(options),
    correct: surah.meaning,
  };
}

function buildVersesQuestion(scope: Surah[]): PutriQuestion {
  const surah = scope[Math.floor(Math.random() * scope.length)];
  const correct = String(surah.verses);
  const distractors = sampleUnique(
    SURAHS.filter((s) => s.verses !== surah.verses).map((s) => String(s.verses)),
    OPTIONS_PER_QUESTION - 1,
  );
  const options = shuffle(Array.from(new Set([correct, ...distractors]))).slice(
    0,
    OPTIONS_PER_QUESTION,
  );

  if (!options.includes(correct)) {
    options[0] = correct;
  }

  return {
    kind: "verses",
    prompt: `Berapa jumlah ayat dari surah ${surah.name}?`,
    surah,
    options: shuffle(options),
    correct,
  };
}

export function buildPutriQuestion(scope: Surah[]): PutriQuestion {
  if (scope.length === 0) {
    throw new Error("Putri Cantik needs at least one surah in scope.");
  }

  return Math.random() < 0.5 ? buildMeaningQuestion(scope) : buildVersesQuestion(scope);
}

export function isPutriAnswerCorrect(question: PutriQuestion, answer: string): boolean {
  return answer === question.correct;
}
```

- [ ] **Step 4: Add localStorage helpers**

Append:

```ts
const PUTRI_OUTFIT_STORAGE_KEY = "belajarngaji:putri-cantik:outfit";

export function readPutriOutfit(): PutriOutfit {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PUTRI_OUTFIT_STORAGE_KEY);
    if (!raw) return {};
    return sanitizePutriOutfit(JSON.parse(raw) as unknown);
  } catch {
    return {};
  }
}

export function writePutriOutfit(outfit: PutriOutfit): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PUTRI_OUTFIT_STORAGE_KEY,
      JSON.stringify(sanitizePutriOutfit(outfit)),
    );
  } catch {
    /* storage disabled - keep game playable for this session */
  }
}

export function clearPutriOutfit(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PUTRI_OUTFIT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 5: Verify TypeScript accepts the new module**

Run: `npm run lint`

Expected: exit code 0. Existing npm warnings about `devdir` are acceptable; ESLint errors are not.

---

### Task 2: Register Putri Cantik In Shared App Metadata

**Files:**
- Modify: `src/lib/scope.ts`
- Modify: `src/lib/strings.ts`
- Modify: `README.md`

- [ ] **Step 1: Add the new game ID**

Change `src/lib/scope.ts`:

```ts
export type GameId = "kuis" | "cocokkan" | "tebak-ayat" | "sambung" | "putri-cantik";
```

- [ ] **Step 2: Add user-facing strings**

In `src/lib/strings.ts`, add these keys inside the exported object:

```ts
navPutriCantik: "Putri Cantik",
cardPutriCantikTitle: "Putri Cantik",
cardPutriCantikDesc: "Jawab soal, lalu pakaikan baju pixel untuk sang putri.",
putriCantikTitle: "Putri Cantik",
putriCantikSubtitle:
  "Pilih baju untuk putri. Jawab soal dengan benar agar bajunya bisa dipakai!",
putriQuestionTitle: "Jawab dulu ya",
putriCorrect: "Benar! Bajunya berhasil dipakai.",
putriWrong: "Belum benar. Bajunya belum bisa dipakai.",
putriCurrentScore: "Percobaan benar",
putriResetOutfit: "Reset Baju",
putriPickItem: "Pilih",
```

Place the navigation/card strings near the existing nav/card strings and the game-specific strings near the other gameplay strings.

- [ ] **Step 3: Update README feature list**

In `README.md`, add a row to the feature table:

```md
| `/putri-cantik` | Dress-up pixel putri: jawab soal campuran arti surah dan jumlah ayat untuk memakai atau mengganti item wardrobe |
```

Add a short note near the license/character section:

```md
Game **Putri Cantik** menggunakan pixel art orisinal yang dibuat langsung di dalam komponen aplikasi, tanpa bundel aset karakter pihak ketiga.
```

- [ ] **Step 4: Verify shared metadata changes**

Run: `npm run lint`

Expected: exit code 0.

---

### Task 3: Build Scoped Wrapper And Route

**Files:**
- Create: `src/components/ScopedPutriCantikGame.tsx`
- Create: `src/app/putri-cantik/page.tsx`
- Create placeholder component in: `src/components/PutriCantikGame.tsx`

- [ ] **Step 1: Create a minimal placeholder game component**

Create `src/components/PutriCantikGame.tsx`:

```tsx
"use client";

import type { Surah } from "@/data/surahs";

export function PutriCantikGame({ scope }: { scope: Surah[] }) {
  return (
    <section className="rounded-3xl bg-white/95 p-6 text-center shadow-lg ring-4 ring-pink-100">
      <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
        {scope.length} surah dipilih
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-pink-700">
        Putri Cantik segera siap bermain.
      </h2>
    </section>
  );
}
```

- [ ] **Step 2: Create scoped wrapper**

Create `src/components/ScopedPutriCantikGame.tsx`:

```tsx
"use client";

import { PutriCantikGame } from "./PutriCantikGame";
import { ScopedGame } from "./ScopedGame";

const DEFAULT_SCOPE = [1, 112, 113, 114, 110, 109, 108];

export function ScopedPutriCantikGame() {
  return (
    <ScopedGame gameId="putri-cantik" minimum={1} defaultScope={DEFAULT_SCOPE}>
      {(scope) => <PutriCantikGame scope={scope} />}
    </ScopedGame>
  );
}
```

- [ ] **Step 3: Create app route**

Create `src/app/putri-cantik/page.tsx`:

```tsx
import { ScopedPutriCantikGame } from "@/components/ScopedPutriCantikGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navPutriCantik} — ${strings.siteTitle}`,
  description: "Game dress-up pixel putri dengan soal campuran Al-Qur'an.",
};

export default function PutriCantikPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-pink-100">
        <h1 className="text-2xl font-extrabold text-pink-600 sm:text-3xl">
          {strings.putriCantikTitle}
        </h1>
        <p className="mt-1 text-base font-semibold text-pink-900/70">
          {strings.putriCantikSubtitle}
        </p>
      </section>
      <ScopedPutriCantikGame />
    </div>
  );
}
```

- [ ] **Step 4: Verify route compiles**

Run: `npm run build`

Expected: exit code 0 and route list includes `/putri-cantik`.

---

### Task 4: Add Pixel Princess And Wardrobe UI

**Files:**
- Replace placeholder: `src/components/PutriCantikGame.tsx`

- [ ] **Step 1: Replace placeholder with layout and pixel art helpers**

Replace the whole file with a client component that imports:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Surah } from "@/data/surahs";
import { strings } from "@/lib/strings";
import {
  PUTRI_SLOT_LABELS,
  PUTRI_WARDROBE_SLOTS,
  buildPutriQuestion,
  clearPutriOutfit,
  equipPutriItem,
  findPutriItem,
  putriItemsBySlot,
  readPutriOutfit,
  writePutriOutfit,
  type PutriOutfit,
  type PutriQuestion,
  type PutriWardrobeItem,
  type PutriWardrobeSlot,
} from "@/lib/putri-cantik";
```

Use these local state types:

```tsx
type PendingDressUp =
  | { phase: "idle" }
  | { phase: "question"; item: PutriWardrobeItem; question: PutriQuestion }
  | { phase: "result"; item: PutriWardrobeItem; question: PutriQuestion; chosen: string; correct: boolean };
```

Initialize state:

```tsx
const [outfit, setOutfit] = useState<PutriOutfit>({});
const [pending, setPending] = useState<PendingDressUp>({ phase: "idle" });
const [correctCount, setCorrectCount] = useState(0);
const [attemptCount, setAttemptCount] = useState(0);

useEffect(() => {
  setOutfit(readPutriOutfit());
}, []);
```

- [ ] **Step 2: Add equip attempt handlers**

Inside `PutriCantikGame`, implement:

```tsx
const equippedItems = useMemo(
  () =>
    Object.values(outfit)
      .map((itemId) => (itemId ? findPutriItem(itemId) : null))
      .filter((item): item is PutriWardrobeItem => Boolean(item)),
  [outfit],
);

const startQuestion = (item: PutriWardrobeItem) => {
  setPending({
    phase: "question",
    item,
    question: buildPutriQuestion(scope),
  });
};

const answerQuestion = (answer: string) => {
  if (pending.phase !== "question") return;
  const correct = answer === pending.question.correct;
  setAttemptCount((count) => count + 1);
  if (correct) {
    setCorrectCount((count) => count + 1);
    const next = equipPutriItem(outfit, pending.item);
    setOutfit(next);
    writePutriOutfit(next);
  }
  setPending({
    phase: "result",
    item: pending.item,
    question: pending.question,
    chosen: answer,
    correct,
  });
};

const closeQuestion = () => {
  setPending({ phase: "idle" });
};

const resetOutfit = () => {
  setOutfit({});
  clearPutriOutfit();
  setPending({ phase: "idle" });
};
```

- [ ] **Step 3: Render main game shell**

Return this structure from `PutriCantikGame`:

```tsx
return (
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
    <PrincessPanel
      equippedItems={equippedItems}
      correctCount={correctCount}
      attemptCount={attemptCount}
      onReset={resetOutfit}
    />
    <WardrobePanel outfit={outfit} onPick={startQuestion} />
    {pending.phase !== "idle" && (
      <QuestionCard pending={pending} onAnswer={answerQuestion} onClose={closeQuestion} />
    )}
  </div>
);
```

- [ ] **Step 4: Add `PrincessPanel` and base pixel art**

In the same file, add:

```tsx
function PrincessPanel({
  equippedItems,
  correctCount,
  attemptCount,
  onReset,
}: {
  equippedItems: PutriWardrobeItem[];
  correctCount: number;
  attemptCount: number;
  onReset: () => void;
}) {
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-pink-100 via-rose-50 to-yellow-100 p-5 shadow-lg ring-4 ring-white/70">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
            Pixel Dress-Up
          </p>
          <h2 className="text-2xl font-extrabold text-pink-700">Putri Cantik</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-pink-700 shadow ring-2 ring-pink-200 transition hover:bg-pink-50 active:scale-95"
        >
          {strings.putriResetOutfit}
        </button>
      </div>

      <div className="mt-5 grid place-items-center rounded-[2rem] bg-white/75 p-5 shadow-inner ring-2 ring-pink-100">
        <PixelPrincess equippedItems={equippedItems} />
      </div>

      <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-bold text-pink-800 shadow-sm ring-2 ring-pink-100">
        {strings.putriCurrentScore}: <span className="text-emerald-600">{correctCount}</span> / {attemptCount}
      </p>
    </section>
  );
}
```

Add `PixelPrincess` using absolutely positioned divs with pixelated square edges. Keep the base modest: hair, face, basic white shirt, blue long pants. Use `equippedItems.map` to render layers.

- [ ] **Step 5: Add wardrobe panel**

Add:

```tsx
function WardrobePanel({
  outfit,
  onPick,
}: {
  outfit: PutriOutfit;
  onPick: (item: PutriWardrobeItem) => void;
}) {
  return (
    <section className="rounded-[2rem] bg-white/95 p-5 shadow-lg ring-4 ring-pink-100">
      <h2 className="text-2xl font-extrabold text-pink-700">Wardrobe</h2>
      <div className="mt-4 flex flex-col gap-5">
        {PUTRI_WARDROBE_SLOTS.map((slot) => (
          <WardrobeSlotGroup
            key={slot}
            slot={slot}
            equippedItemId={outfit[slot]}
            onPick={onPick}
          />
        ))}
      </div>
    </section>
  );
}
```

Implement `WardrobeSlotGroup` to render `putriItemsBySlot(slot)` as buttons. Each button shows a mini color swatch, `item.label`, `item.description`, and a `Dipakai` badge when `equippedItemId === item.id`.

- [ ] **Step 6: Add question modal/card**

Implement `QuestionCard`:

```tsx
function QuestionCard({
  pending,
  onAnswer,
  onClose,
}: {
  pending: Exclude<PendingDressUp, { phase: "idle" }>;
  onAnswer: (answer: string) => void;
  onClose: () => void;
}) {
  const revealed = pending.phase === "result";
  const question = pending.question;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <article className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-2xl ring-4 ring-pink-200">
        <p className="text-sm font-bold uppercase tracking-wider text-pink-500">
          {strings.putriQuestionTitle}
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-pink-800">{question.prompt}</h2>
        <p className="arabic mt-1 text-pink-500">{question.surah.arabic}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const isChosen = revealed && pending.chosen === option;
            const isCorrect = revealed && question.correct === option;
            const stateClass = !revealed
              ? "bg-pink-50 text-pink-900 ring-pink-100 hover:bg-pink-100"
              : isCorrect
                ? "bg-emerald-100 text-emerald-900 ring-emerald-300"
                : isChosen
                  ? "bg-red-100 text-red-900 ring-red-300"
                  : "bg-white text-pink-900/50 ring-pink-100";
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => onAnswer(option)}
                className={`rounded-2xl px-4 py-3 text-left text-base font-bold shadow-sm ring-2 transition active:scale-95 ${stateClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-base font-extrabold ${pending.correct ? "text-emerald-700" : "text-red-600"}`}>
              {pending.correct ? strings.putriCorrect : strings.putriWrong}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-pink-500 px-6 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-pink-600 active:scale-95"
            >
              {strings.nextButton}
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
```

- [ ] **Step 7: Verify UI compiles**

Run: `npm run lint && npm run build`

Expected: exit code 0.

---

### Task 5: Connect Navigation And Home Card

**Files:**
- Modify: `src/components/Shell.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add header navigation entry**

In `src/components/Shell.tsx`, add this object before `riwayat`:

```ts
{
  href: "/putri-cantik",
  label: strings.navPutriCantik,
  color: "bg-fuchsia-200 text-fuchsia-900 hover:bg-fuchsia-300",
},
```

- [ ] **Step 2: Add home page card**

In `src/app/page.tsx`, add this card before the history card:

```ts
{
  href: "/putri-cantik",
  title: strings.cardPutriCantikTitle,
  desc: strings.cardPutriCantikDesc,
  bg: "from-pink-300 to-fuchsia-400",
  emoji: "👑",
},
```

- [ ] **Step 3: Verify navigation compiles**

Run: `npm run build`

Expected: exit code 0 and `/putri-cantik` route appears in the build route list.

---

### Task 6: Manual Behavior Verification

**Files:**
- No planned edits unless verification finds defects.

- [ ] **Step 1: Run full static verification**

Run: `npm run lint && npm run build`

Expected: exit code 0.

- [ ] **Step 2: Start or refresh preview**

If no preview is running, run:

```bash
npm start -- -H 127.0.0.1 -p 3419
```

If a stale preview already owns the port, stop it first using a safe per-PID loop:

```bash
lsof -ti tcp:3419 | while read -r PID; do if [ -n "$PID" ]; then kill "$PID"; fi; done
```

Then start the preview command again.

- [ ] **Step 3: Smoke check the route**

Open `http://127.0.0.1:3419/putri-cantik`.

Expected:

- Page header says `Putri Cantik`.
- Scope picker appears if no scope is saved.
- Choosing a default/short scope enters the game.
- Princess appears in basic shirt and long pants.
- Wardrobe groups appear on the right on desktop and below on mobile width.

- [ ] **Step 4: Verify correct-answer equip path**

Manual steps:

1. Choose a wardrobe item.
2. Answer the modal with the correct option.
3. Close the result.

Expected:

- Correct prompt appears.
- Item appears on the princess.
- Counter increments to `1 / 1`.
- If the item replaces another item in the same slot, only the new item remains visible.

- [ ] **Step 5: Verify wrong-answer blocked path**

Manual steps:

1. Choose a different wardrobe item.
2. Answer with an incorrect option.
3. Close the result.

Expected:

- Wrong prompt appears.
- Outfit does not change.
- Counter increments total only.

- [ ] **Step 6: Verify local persistence**

Manual steps:

1. Equip at least two items.
2. Refresh the page.

Expected:

- Previously equipped items still appear.
- Scope remains controlled by the existing scoped-game localStorage behavior.

- [ ] **Step 7: Verify reset outfit**

Manual steps:

1. Click `Reset Baju`.
2. Refresh the page.

Expected:

- Outfit returns to basic shirt and long pants.
- No old wardrobe items reappear after refresh.

---

### Task 7: Cleanup And Documentation Verification

**Files:**
- Modify only if previous tasks reveal inconsistencies: `README.md`, `docs/superpowers/specs/2026-06-27-putri-cantik-design.md`

- [ ] **Step 1: Confirm no third-party art was added**

Run: `rg "kenney|opengameart|itch.io|cc0|creative commons" public src README.md docs/superpowers/specs/2026-06-27-putri-cantik-design.md`

Expected:

- No third-party asset files are present under `public`.
- README/spec may mention original art policy or CC0 fallback, but source code should not claim bundled third-party assets.

- [ ] **Step 2: Check final diff**

Run: `git status --short && git diff -- src docs README.md package.json`

Expected:

- Changes are scoped to Putri Cantik feature files, shared strings/navigation, README, and docs.
- No generated build artifacts are included.

- [ ] **Step 3: Final verification command**

Run: `npm run lint && npm run build`

Expected: exit code 0.

- [ ] **Step 4: Commit handling**

Do not create a git commit unless the user explicitly asks. If the user asks for a commit, follow the repository commit protocol and include only relevant files.

---

## Self-Review Notes

- Spec coverage: route, scoped game, mixed questions, original pixel art, free play, replace-after-correct, local outfit persistence, navigation, README, and verification are covered by tasks above.
- Placeholder scan: no placeholder markers or deferred implementation steps remain.
- Type consistency: `PutriWardrobeSlot`, `PutriWardrobeItem`, `PutriOutfit`, and `PutriQuestion` are introduced before use and reused consistently.
- Test harness: repo has no test files or test script, so manual verification is explicit and pure logic is isolated for future tests.
