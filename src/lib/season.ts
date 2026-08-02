// Seizoensthema: zelfde 3 kleurfamilies, per seizoen een andere accent-tint
// en eigen seizoensproducten. Illustratie-sets haken hier later op in.

export type SeasonKey = "lente" | "zomer" | "herfst" | "winter";

export type SeasonTheme = {
  key: SeasonKey;
  label: string;
  /** Tailwind-classes binnen de terra/ink/cream-families */
  accentBg: string;
  accentText: string;
  heroBg: string;
  /** catalog-keys die nu in het seizoen zijn */
  seasonalItems: string[];
};

const THEMES: Record<SeasonKey, SeasonTheme> = {
  lente: {
    key: "lente",
    label: "Lente",
    accentBg: "bg-terra-300",
    accentText: "text-terra-700",
    heroBg: "bg-terra-50",
    seasonalItems: ["asperges", "rabarber", "radijs", "eieren"],
  },
  zomer: {
    key: "zomer",
    label: "Zomer",
    accentBg: "bg-terra-400",
    accentText: "text-terra-600",
    heroBg: "bg-cream-100",
    seasonalItems: ["aardbeien", "kersen", "tomaten", "courgette", "frambozen"],
  },
  herfst: {
    key: "herfst",
    label: "Herfst",
    accentBg: "bg-terra-600",
    accentText: "text-terra-800",
    heroBg: "bg-terra-100",
    seasonalItems: ["pompoen", "appels", "peren", "noten", "stoofperen"],
  },
  winter: {
    key: "winter",
    label: "Winter",
    accentBg: "bg-ink-700",
    accentText: "text-ink-700",
    heroBg: "bg-cream-200",
    seasonalItems: ["boerenkool", "spruiten", "winterpeen", "stamppotgroente"],
  },
};

export function currentSeason(date: Date = new Date()): SeasonTheme {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return THEMES.lente;
  if (m >= 6 && m <= 8) return THEMES.zomer;
  if (m >= 9 && m <= 11) return THEMES.herfst;
  return THEMES.winter;
}
