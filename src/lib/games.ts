export const GAME_CARD_DEFS = [
  {
    href: "/dekorasi",
    titleKey: "cardDecorateTitle" as const,
    descKey: "cardDecorateDesc" as const,
    bg: "from-sky-300 to-blue-400",
    emoji: "🏠",
  },
  {
    href: "/salon",
    titleKey: "cardSalonTitle" as const,
    descKey: "cardSalonDesc" as const,
    bg: "from-pink-300 to-rose-400",
    emoji: "🎀",
  },
  {
    href: "/bangun-masjid",
    titleKey: "cardBuildTitle" as const,
    descKey: "cardBuildDesc" as const,
    bg: "from-violet-300 to-indigo-400",
    emoji: "🕌",
  },
] as const;
