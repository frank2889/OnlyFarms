"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import SwipeDeck, { type SwipeCard } from "@/components/SwipeDeck";

type Mode = "winkel" | "smaak";

// Winkelmodus = de kandidatenpool (historie/seizoen/basisset) door elkaar
// geschud; smaakmodus (bèta) weegt diezelfde pool op wat je eerder wel/niet
// swipete. Modus wisselen = een nieuw deck (key={mode} reset SwipeDeck).
export default function SwipeModeSwitcher({
  token,
  shopCards,
  tasteCards,
}: {
  token: string;
  shopCards: SwipeCard[];
  tasteCards: SwipeCard[];
}) {
  const [mode, setMode] = useState<Mode>("winkel");

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-full bg-cream-100 p-1">
        <button
          onClick={() => setMode("winkel")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            mode === "winkel" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          {t("swipe.modeShop")}
        </button>
        <button
          onClick={() => setMode("smaak")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            mode === "smaak" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          {t("swipe.modeTaste")}
          <span className="rounded-full bg-terra-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-terra-700">
            {t("swipe.beta")}
          </span>
        </button>
      </div>
      {mode === "smaak" && (
        <p className="mb-3 text-xs text-ink-500">{t("swipe.modeTasteHint")}</p>
      )}
      <SwipeDeck key={mode} token={token} cards={mode === "winkel" ? shopCards : tasteCards} />
    </div>
  );
}
