"use client";

import { createElement, useRef, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { catalogItem } from "@/lib/catalog";
import { iconForItem, tintForCategory } from "@/components/catalog-icons";
import { CheckIcon, XIcon } from "@/components/icons";
import { addItemAction, recordSwipeAction, removeCatalogItemAction } from "@/app/lijst/actions";

export type SwipeCard = { key: string; label: string; category: string; times?: number };

// Tinder-patroon voor je vaste boodschappen: rechts = op de lijst, links =
// overslaan. Gestures via pointer events; de grote knoppen eronder doen
// hetzelfde (toegankelijk voor wie niet swipet).
export default function SwipeDeck({ token, cards }: { token: string; cards: SwipeCard[] }) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const [skipped, setSkipped] = useState<SwipeCard[]>([]);
  const [last, setLast] = useState<{ card: SwipeCard; dir: "left" | "right" } | null>(null);
  const [flying, setFlying] = useState<"left" | "right" | null>(null);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; y: number; t: number; claimed: boolean } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = deck[index];

  function bumpBadge(delta: number) {
    const badge = Number(localStorage.getItem("of_badge") ?? "0") || 0;
    localStorage.setItem("of_badge", String(Math.max(0, badge + delta)));
  }

  function commit(dir: "left" | "right") {
    if (!current || flying) return;
    setFlying(dir);
  }

  function onFlyEnd() {
    if (!flying || !current) return;
    if (flying === "right") {
      navigator.vibrate?.(10);
      // fire-and-forget: idempotente action, UI blokkeert niet per kaart
      void addItemAction(token, { catalogKey: current.key, label: current.label });
      setAddedCount((n) => n + 1);
      bumpBadge(1);
    } else {
      setSkipped((s) => [...s, current]);
    }
    // Voedt de bèta-smaakmodus, ongeacht welke modus nu actief is
    void recordSwipeAction(token, current.key, flying === "right");
    setLast({ card: current, dir: flying });
    setFlying(null);
    setDx(0);
    setIndex((i) => i + 1);
  }

  function undo() {
    if (!last || flying) return;
    if (last.dir === "right") {
      void removeCatalogItemAction(token, last.card.key);
      setAddedCount((n) => Math.max(0, n - 1));
      bumpBadge(-1);
    } else {
      setSkipped((s) => s.slice(0, -1));
    }
    setIndex((i) => Math.max(0, i - 1));
    setLast(null);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (flying) return;
    drag.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, claimed: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || flying) return;
    const moveX = e.clientX - d.x;
    const moveY = e.clientY - d.y;
    if (!d.claimed) {
      // dominante as bepalen: verticaal blijft gewoon scrollen
      if (Math.abs(moveX) > 8 && Math.abs(moveX) > Math.abs(moveY)) {
        d.claimed = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } else if (Math.abs(moveY) > 8) {
        drag.current = null;
        return;
      }
    }
    if (d.claimed) setDx(moveX);
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d?.claimed || flying) {
      setDx(0);
      return;
    }
    const moveX = e.clientX - d.x;
    const width = cardRef.current?.offsetWidth ?? 300;
    const velocity = Math.abs(moveX) / Math.max(1, e.timeStamp - d.t);
    if (Math.abs(moveX) > width * 0.35 || velocity > 0.6) {
      commit(moveX > 0 ? "right" : "left");
    } else {
      setDx(0);
    }
  }

  function restartWithSkipped() {
    setDeck(skipped);
    setSkipped([]);
    setIndex(0);
    setLast(null);
    setDx(0);
  }

  // Eindkaart (of leeg deck vanaf het begin)
  if (!current) {
    return (
      <div className="rounded-tile border border-cream-200 bg-white p-6 text-center">
        <p className="text-xl font-bold">
          {deck.length === 0 ? t("swipe.empty") : t("swipe.doneTitle")}
        </p>
        {deck.length > 0 && (
          <p className="mt-1 text-ink-500">{t("swipe.doneText", { n: addedCount })}</p>
        )}
        <div className="mt-5 flex flex-col items-center gap-3">
          <Link
            href={`/lijst/${token}#lijst`}
            className="rounded-full bg-terra-500 px-6 py-3 font-medium text-white hover:bg-terra-600"
          >
            {t("swipe.viewList")}
          </Link>
          {skipped.length > 0 && (
            <button onClick={restartWithSkipped} className="text-sm text-ink-500 underline">
              {t("swipe.again")}
            </button>
          )}
        </div>
      </div>
    );
  }

  const stack = deck.slice(index, index + 3);

  return (
    <div>
      <div className="relative mx-auto aspect-3/4 w-full max-w-xs select-none">
        {stack
          .map((card, i) => ({ card, i }))
          .reverse()
          .map(({ card, i }) => {
            const item = catalogItem(card.key);
            const tint = tintForCategory(card.category as Parameters<typeof tintForCategory>[0]);
            const top = i === 0;
            const hint = top ? Math.min(Math.abs(dx) / 90, 1) : 0;
            return (
              <div
                key={card.key}
                ref={top ? cardRef : undefined}
                onPointerDown={top ? onPointerDown : undefined}
                onPointerMove={top ? onPointerMove : undefined}
                onPointerUp={top ? onPointerUp : undefined}
                onPointerCancel={top ? onPointerUp : undefined}
                onAnimationEnd={top ? onFlyEnd : undefined}
                style={
                  top && !flying
                    ? {
                        transform: dx ? `translateX(${dx}px) rotate(${dx * 0.05}deg)` : undefined,
                        transition: dx ? "none" : "transform 0.2s ease-out",
                        touchAction: "pan-y",
                      }
                    : undefined
                }
                className={`absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-tile border border-cream-200 p-6 shadow-sm ${tint.tileBg} ${
                  top && flying === "right" ? "animate-fly-right" : ""
                } ${top && flying === "left" ? "animate-fly-left" : ""} ${
                  !top ? (i === 1 ? "translate-y-2 scale-95" : "translate-y-4 scale-90") : ""
                }`}
              >
                {item &&
                  createElement(iconForItem(item), {
                    width: 110,
                    height: 110,
                    className: tint.icon,
                  })}
                <p className="text-center text-2xl font-bold">{card.label}</p>
                {card.times ? (
                  <p className="text-sm text-ink-700">{t("swipe.historyLine", { n: card.times })}</p>
                ) : null}

                {top && (
                  <>
                    <span
                      className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-terra-500 text-white"
                      style={{ opacity: dx > 0 ? hint : 0 }}
                      aria-hidden
                    >
                      <CheckIcon width={28} height={28} />
                    </span>
                    <span
                      className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white"
                      style={{ opacity: dx < 0 ? hint : 0 }}
                      aria-hidden
                    >
                      <XIcon width={28} height={28} />
                    </span>
                  </>
                )}
              </div>
            );
          })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-8">
        <button
          onClick={() => commit("left")}
          aria-label={t("swipe.skip")}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink-300 bg-white text-ink-700 active:scale-95"
        >
          <XIcon width={28} height={28} />
        </button>
        <button
          onClick={() => commit("right")}
          aria-label={t("swipe.add")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-terra-500 text-white shadow-sm hover:bg-terra-600 active:scale-95"
        >
          <CheckIcon width={30} height={30} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-ink-500">
        <span>{t("swipe.addedCount", { n: addedCount })}</span>
        {last && (
          <button onClick={undo} className="underline">
            {t("swipe.undo")}
          </button>
        )}
        <Link href={`/lijst/${token}#lijst`} className="text-terra-700 underline">
          {t("swipe.viewList")}
        </Link>
      </div>
    </div>
  );
}
