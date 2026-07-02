import { strings } from "@/lib/strings";

export const GAME_CARDS = [
  {
    href: "/kuis",
    title: strings.cardQuizTitle,
    desc: strings.cardQuizDesc,
    bg: "from-yellow-300 to-orange-400",
    emoji: "⭐",
  },
  {
    href: "/cocokkan",
    title: strings.cardMatchTitle,
    desc: strings.cardMatchDesc,
    bg: "from-emerald-300 to-teal-400",
    emoji: "🎯",
  },
  {
    href: "/tebak-ayat",
    title: strings.cardGuessTitle,
    desc: strings.cardGuessDesc,
    bg: "from-violet-300 to-fuchsia-400",
    emoji: "🔢",
  },
  {
    href: "/sambung",
    title: strings.cardConnectTitle,
    desc: strings.cardConnectDesc,
    bg: "from-orange-300 to-rose-400",
    emoji: "🔗",
  },
  {
    href: "/ular-tangga",
    title: strings.cardSnakeLadderTitle,
    desc: strings.cardSnakeLadderDesc,
    bg: "from-lime-300 to-emerald-400",
    emoji: "🎲",
  },
] as const;
