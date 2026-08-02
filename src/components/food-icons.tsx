import type { SVGProps } from "react";

/**
 * Gevulde, cartoonachtige item-iconen — elk item zijn eigen silhouet.
 * Twee-tonig binnen de huisstijl: currentColor (tile bepaalt de tint),
 * met details in cream en terra-700 via CSS-variabelen.
 */
type IconProps = SVGProps<SVGSVGElement>;

const CREAM = "var(--color-cream-50)";
const DARK = "var(--color-terra-700)";
const INK = "var(--color-ink-700)";

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---------- Zuivel ---------- */

export function FoodMelk(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 2h6a1 1 0 0 1 1 1v2.2l1.7 3A2 2 0 0 1 18 9.2V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9.2a2 2 0 0 1 .3-1L8 5.2V3a1 1 0 0 1 1-1Z" />
      <rect x="6" y="12" width="12" height="5" fill={CREAM} />
      <rect x="9.5" y="2" width="5" height="2" fill={DARK} />
    </Svg>
  );
}

export function FoodYoghurt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 7h12l-1.3 13a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8Z" />
      <ellipse cx="12" cy="7" rx="6" ry="1.8" fill={CREAM} />
      <path d="M14 6.8 18.5 2a1.2 1.2 0 0 1 1.7 1.7L16 7.5Z" fill={DARK} />
    </Svg>
  );
}

export function FoodKwark(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <ellipse cx="12" cy="8.5" rx="8" ry="2.4" fill={CREAM} />
      <rect x="6.5" y="13" width="11" height="4" rx="1" fill={CREAM} opacity="0.7" />
    </Svg>
  );
}

export function FoodBoter(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10.5 8 6h13l-4 4.5Z" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <rect x="4" y="10.5" width="13" height="7.5" rx="1" />
      <path d="M17 10.5 21 6v7.5l-4 4.5Z" fill={DARK} />
    </Svg>
  );
}

export function FoodIjs(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7.5 11 12 22.5 16.5 11Z" fill={DARK} />
      <path d="M8.6 13.5h6.8M9.8 16.5h4.4" stroke={CREAM} strokeWidth="1" />
      <circle cx="12" cy="7.5" r="5.5" />
      <circle cx="10" cy="6" r="1.5" fill={CREAM} />
    </Svg>
  );
}

/* ---------- Eieren ---------- */

export function FoodEi(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2c3.8 0 7 6 7 12a7 7 0 0 1-14 0c0-6 3.2-12 7-12Z" />
      <path d="M12 4.5c2.6 0 5 4.8 5 9.5a5 5 0 0 1-10 0c0-4.7 2.4-9.5 5-9.5Z" fill={CREAM} />
      <circle cx="12" cy="14" r="3" fill={DARK} opacity="0.85" />
    </Svg>
  );
}

/* ---------- Kaas ---------- */

export function FoodKaas(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 15.5 21 9.5a1 1 0 0 1 1 .1V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" />
      <circle cx="7" cy="16.2" r="1.3" fill={CREAM} />
      <circle cx="12.5" cy="15.3" r="1" fill={CREAM} />
      <circle cx="17" cy="13.6" r="1.2" fill={CREAM} />
    </Svg>
  );
}

export function FoodGeitenkaas(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <ellipse cx="12" cy="10" rx="8" ry="2.8" fill={CREAM} />
      <path d="M12 10 20 8.5V12l-8 1Z" fill={DARK} opacity="0.5" />
    </Svg>
  );
}

/* ---------- Vlees ---------- */

export function FoodRund(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 8c2-3 6-4 9.5-3.5 4.4.6 7.5 3.4 7 7-.4 3.2-3 5.5-6.5 6.5C9.5 19.3 4.8 18 3.5 14 2.9 12 3 9.7 4 8Z" />
      <ellipse cx="12.5" cy="11.5" rx="4.5" ry="3.2" fill={CREAM} />
      <circle cx="12.5" cy="11.5" r="1.3" fill={DARK} />
    </Svg>
  );
}

export function FoodVarken(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 5 8 7.5h8L19.5 5c1 1.2 1.4 3 .8 4.5C21.4 10.8 22 12.3 22 14c0 4-4.5 7-10 7S2 18 2 14c0-1.7.6-3.2 1.7-4.5C3.1 8 3.5 6.2 4.5 5Z" />
      <ellipse cx="12" cy="14.5" rx="4.5" ry="3.5" fill={CREAM} />
      <circle cx="10.3" cy="14.5" r="1" fill={INK} />
      <circle cx="13.7" cy="14.5" r="1" fill={INK} />
    </Svg>
  );
}

export function FoodKip(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9.5" cy="9" r="6.5" />
      <path d="M13.5 13.5 18 18" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
      <circle cx="18.8" cy="17.5" r="1.7" fill={CREAM} />
      <circle cx="17.3" cy="19.3" r="1.7" fill={CREAM} />
      <path d="M7 7c.5-1 1.5-1.8 2.7-2" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodWorst(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 16.5C4 10 10 4 16.5 4c1.6 0 3 1.3 3 3C19.5 13.5 13.5 19.5 7 19.5c-1.7 0-3-1.4-3-3Z" />
      <path d="M8.5 14.5c1.5-2.5 3.5-4.5 6-6" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="19.5" cy="4.5" r="1.5" fill={DARK} />
      <circle cx="4.5" cy="19.5" r="1.5" fill={DARK} />
    </Svg>
  );
}

export function FoodLam(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="7" cy="9" r="3" />
      <circle cx="12" cy="7" r="3.2" />
      <circle cx="17" cy="9" r="3" />
      <circle cx="18" cy="13" r="3" />
      <circle cx="6" cy="13" r="3" />
      <circle cx="12" cy="12.5" r="4.5" />
      <ellipse cx="12" cy="17" rx="3.4" ry="4" fill={CREAM} />
      <circle cx="10.8" cy="16.5" r=".8" fill={INK} />
      <circle cx="13.2" cy="16.5" r=".8" fill={INK} />
    </Svg>
  );
}

/* ---------- Groente ---------- */

export function FoodWortel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.5 9.5c1.8 1.8 2 4 .5 5.5l-9.4 7c-1 .7-2.3-.6-1.6-1.6l7-9.4c1.5-1.5 3.7-1.3 5.5.5Z" />
      <path d="M7.5 16.5l2 2M10.5 13l2.5 2.5" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M15 9c0-2 1-4 3-5 .3 1.4 0 2.6-.8 3.8C18.4 7 19.6 6.7 21 7c-1 2-3 3-5 3Z" fill={DARK} />
    </Svg>
  );
}

export function FoodTomaat(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13.5" r="8.5" />
      <path d="M12 5.5 10 3m2 2.5L14.5 3M12 5.5 8.5 6.5m3.5-1 3.5 1" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="11" r="1.6" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodCourgette(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="1.5" y="12" width="17" height="7" rx="3.5" transform="rotate(-25 10 15.5)" />
      <path d="m17.5 7 2.5-2.5a1.4 1.4 0 0 1 2 2L19.5 9Z" fill={DARK} />
      <path d="M6 16.5c3-.8 6-2.4 8.5-4.5" stroke={CREAM} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodAsperge(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="6.4" y="6" width="3" height="16" rx="1.5" />
      <path d="M7.9 2 9.6 6H6.2Z" fill={DARK} />
      <rect x="10.6" y="4" width="3" height="18" rx="1.5" />
      <path d="M12.1 0.5 13.8 4.5h-3.4Z" fill={DARK} />
      <rect x="14.8" y="6" width="3" height="16" rx="1.5" />
      <path d="M16.3 2 18 6h-3.4Z" fill={DARK} />
    </Svg>
  );
}

export function FoodPompoen(p: IconProps) {
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="14" rx="9.5" ry="7.5" />
      <ellipse cx="12" cy="14" rx="4" ry="7.5" fill={DARK} opacity="0.45" />
      <path d="M11 6c0-2 .5-3.5 2-4.5.8 1.2.8 2.7.3 4.5Z" fill={INK} />
    </Svg>
  );
}

export function FoodBoerenkool(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.5c1.8 0 2.6 1.4 2.2 2.6 1.7-.8 3.6.2 3.5 2 1.6.3 2.4 2.2 1.4 3.6 1.3 1 1.2 3-.3 3.8.5 1.7-.8 3.3-2.6 3-.3 1.7-2.3 2.5-3.7 1.5-.9 1.3-3 1.3-3.9 0-1.5 1-3.5.2-3.8-1.5-1.7.3-3-1.3-2.5-3-1.5-.8-1.6-2.8-.3-3.8-1-1.4-.2-3.3 1.4-3.6-.1-1.8 1.8-2.8 3.5-2C9.4 3.9 10.2 2.5 12 2.5Z" />
      <path d="M12 8v10M12 11l-3-2M12 13l3-2" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodSpruiten(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="7.5" cy="8" r="5" />
      <circle cx="16.5" cy="9.5" r="4.2" />
      <circle cx="11" cy="16" r="5.2" />
      <path d="M9 14.5c.8 1.6 2.4 2.6 4 2.7" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M5.8 6.5C6.5 8 8 9 9.4 9.1" stroke={CREAM} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodRadijs(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="13" r="6.5" />
      <path d="M11 19.5 10 23" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12.5 7c-.3-2.3.7-4.3 2.8-5.5.6 1.5.4 3-.5 4.4 1.6-.6 3.2-.5 4.7.4-1.8 1.6-4 2-6 1.2Z" fill={DARK} />
      <circle cx="8.8" cy="11" r="1.4" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodStamppot(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" />
      <rect x="1.5" y="10" width="21" height="2.4" rx="1.2" fill={DARK} />
      <path d="M9 7c-.8-1 .8-1.8 0-3M13 7c-.8-1 .8-1.8 0-3M17 7c-.8-1 .8-1.8 0-3" stroke={INK} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="15.5" r="1.2" fill={CREAM} />
      <circle cx="14" cy="17" r="1.2" fill={CREAM} />
    </Svg>
  );
}

export function FoodRabarber(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="7" y="8" width="3.2" height="14" rx="1.6" />
      <rect x="12" y="10" width="3.2" height="12" rx="1.6" fill={DARK} />
      <path d="M8.5 8C5 7 3 4.5 3 2c3.5 0 6.5 1.5 8 4.5C13 4 16.5 3 20 4c-1 3-4.5 5-8 4.5Z" />
      <path d="M11 6.5C9.5 5 7 4 5 4" stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/* ---------- Fruit ---------- */

export function FoodAppel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 7c1.2-.8 2.8-1.5 4.5-1.5 3 0 5 2.3 5 5.5 0 4.5-3 10-6 10-1.2 0-2.3-.8-3.5-.8s-2.3.8-3.5.8c-3 0-6-5.5-6-10 0-3.2 2-5.5 5-5.5C9.2 5.5 10.8 6.2 12 7Z" />
      <path d="M12 6.5c-.2-2 .8-3.7 2.8-4.5.4 2-.6 3.8-2.8 4.5Z" fill={DARK} />
      <circle cx="8.3" cy="10.5" r="1.5" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodAardbei(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 6.5c4.5 0 8 2 8 5.5 0 4.5-4.5 9.5-8 10.5-3.5-1-8-6-8-10.5 0-3.5 3.5-5.5 8-5.5Z" />
      <path d="M12 7 9.5 3.5m2.5 3.5 2.5-3.5M12 7 7.5 6m4.5 1 4.5-1" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="9" cy="11.5" r=".9" fill={CREAM} />
      <circle cx="15" cy="11.5" r=".9" fill={CREAM} />
      <circle cx="12" cy="14.5" r=".9" fill={CREAM} />
      <circle cx="10" cy="17.5" r=".9" fill={CREAM} />
      <circle cx="14" cy="17.5" r=".9" fill={CREAM} />
    </Svg>
  );
}

export function FoodPeer(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.5 8.5c2.5 1 4.5 3.5 4.5 6.5a6.5 6.5 0 0 1-13 0c0-3 2-5.5 4.5-6.5.8-.4 1-1.2 1-2.5h2c0 1.3.2 2.1 1 2.5Z" />
      <path d="M12 5.5c-.1-1.8.7-3.2 2.4-4 .4 1.7-.4 3.3-2.4 4Z" fill={DARK} />
      <circle cx="9.5" cy="14" r="1.5" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodKers(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="7.5" cy="16" r="5" />
      <circle cx="16.5" cy="17" r="4.5" fill={DARK} />
      <path d="M7.5 11.5C9 8 12 5 16 4m.5 13C16 12.5 16 8 16 4" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M16 4c1.5-1.5 3.5-2 5.5-1.5-.7 1.8-2.4 3-5.5 1.5Z" fill={DARK} />
      <circle cx="5.8" cy="14.5" r="1.2" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodFramboos(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8.5" cy="11" r="3" />
      <circle cx="15.5" cy="11" r="3" />
      <circle cx="12" cy="9.5" r="3" />
      <circle cx="7.5" cy="15" r="3" />
      <circle cx="16.5" cy="15" r="3" />
      <circle cx="12" cy="14" r="3.2" />
      <circle cx="10" cy="18.5" r="2.8" />
      <circle cx="14" cy="18.5" r="2.8" />
      <circle cx="12" cy="21" r="2" />
      <path d="M12 6.5 10 3.5m2 3 2-3M12 6.5 8.5 5.5m3.5 1 3.5-1" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="10.5" cy="12.5" r=".8" fill={CREAM} />
      <circle cx="13.8" cy="15.8" r=".8" fill={CREAM} />
    </Svg>
  );
}

export function FoodStoofpeer(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.5 8.5c2.5 1 4.5 3.5 4.5 6.5a6.5 6.5 0 0 1-13 0c0-3 2-5.5 4.5-6.5.8-.4 1-1.2 1-2.5h2c0 1.3.2 2.1 1 2.5Z" fill={DARK} />
      <path d="M12 5.5c-.1-1.8.7-3.2 2.4-4 .4 1.7-.4 3.3-2.4 4Z" fill={INK} />
      <path d="M8.5 13.5c-.3 2 .4 3.9 1.8 5.2" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/* ---------- Aardappelen ---------- */

export function FoodAardappel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 8c2-3.5 7-4.5 11-3 3.5 1.3 5.5 4.5 4.5 8-1 3.8-5 6.5-9.5 6C6.5 18.5 3.5 15.5 3.5 12c0-1.5.6-2.9 1.5-4Z" />
      <circle cx="8.5" cy="10.5" r=".9" fill={DARK} />
      <circle cx="14" cy="9" r=".9" fill={DARK} />
      <circle cx="12" cy="14.5" r=".9" fill={DARK} />
      <circle cx="16.5" cy="13.5" r=".9" fill={DARK} />
    </Svg>
  );
}

/* ---------- Brood ---------- */

export function FoodBrood(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4C6.5 4 3 6.3 3 9.5c0 1.6 1 2.9 2.2 3.4V19a1.5 1.5 0 0 0 1.5 1.5h10.6A1.5 1.5 0 0 0 18.8 19v-6.1C20 12.4 21 11.1 21 9.5 21 6.3 17.5 4 12 4Z" />
      <path d="M8.5 9.5 7 12m5.5-2.5L11 12m5.5-2.5L15 12" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/* ---------- Zoet ---------- */

export function FoodHoning(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 9.5C4.8 10.6 4 12.2 4 14c0 3.9 3.6 7 8 7s8-3.1 8-7c0-1.8-.8-3.4-2-4.5V8H6Z" />
      <rect x="7" y="5" width="10" height="3.2" rx="1.6" fill={DARK} />
      <path d="M8.5 13.5c0 1.2.6 2.3 1.5 3" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M17 2.5c1 0 1.8.8 1.8 1.8S18 6 17 6s-1.8-.7-1.8-1.7.8-1.8 1.8-1.8Z" fill={INK} />
    </Svg>
  );
}

export function FoodJam(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h12v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19Z" />
      <rect x="5" y="4" width="14" height="3.5" rx="1.5" fill={DARK} />
      <circle cx="12" cy="14.5" r="3.3" fill={CREAM} />
      <circle cx="11" cy="13.8" r=".8" fill={DARK} />
      <circle cx="13.2" cy="15.3" r=".8" fill={DARK} />
    </Svg>
  );
}

/* ---------- Dranken ---------- */

export function FoodSap(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 5h11l-1.4 15.5a1.6 1.6 0 0 1-1.6 1.5H9.5a1.6 1.6 0 0 1-1.6-1.5Z" />
      <path d="M7 10.5h10" stroke={CREAM} strokeWidth="1.3" fill="none" />
      <path d="M12.5 5 16 1" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="9.8" cy="14.5" r="1" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

export function FoodBier(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="7" width="11" height="14" rx="2" />
      <path d="M16 10h2.5a2.5 2.5 0 0 1 0 5.5H16" fill="none" stroke={DARK} strokeWidth="2" />
      <circle cx="7.5" cy="6" r="2.5" fill={CREAM} />
      <circle cx="11" cy="4.8" r="2.8" fill={CREAM} />
      <circle cx="14.3" cy="6.2" r="2.3" fill={CREAM} />
      <path d="M8 11v6" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodWijn(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 2h10c.5 3 .5 5.5 0 7.5A5.2 5.2 0 0 1 13 13v6h3.2a1 1 0 0 1 0 2H7.8a1 1 0 0 1 0-2H11v-6a5.2 5.2 0 0 1-4-3.5C6.5 7.5 6.5 5 7 2Z" />
      <path d="M6.9 6h10.2c.1-1.3 0-2.6-.2-4H7.1c-.2 1.4-.3 2.7-.2 4Z" fill={DARK} />
    </Svg>
  );
}

/* ---------- Overig ---------- */

export function FoodNoot(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 9c3.5 0 6.5 1 6.5 4 0 4-3 8-6.5 9-3.5-1-6.5-5-6.5-9 0-3 3-4 6.5-4Z" />
      <path d="M5 8.5C5 5.5 8 3 12 3s7 2.5 7 5.5c0 .8-.6 1.5-1.5 1.5h-11C5.6 10 5 9.3 5 8.5Z" fill={DARK} />
      <path d="M12 5v3" stroke={CREAM} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodBloem(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="6.5" r="3.5" />
      <circle cx="6.8" cy="10.5" r="3.5" />
      <circle cx="17.2" cy="10.5" r="3.5" />
      <circle cx="8.8" cy="16" r="3.5" />
      <circle cx="15.2" cy="16" r="3.5" />
      <circle cx="12" cy="12" r="3.2" fill={CREAM} />
      <circle cx="12" cy="12" r="1.2" fill={DARK} />
      <path d="M12 19v3.5" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodGroenteMand(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.5 9.5c1.8 1.8 2 4 .5 5.5l-9.4 7c-1 .7-2.3-.6-1.6-1.6l7-9.4c1.5-1.5 3.7-1.3 5.5.5Z" />
      <path d="M15 9c0-2 1-4 3-5 .3 1.4 0 2.6-.8 3.8C18.4 7 19.6 6.7 21 7c-1 2-3 3-5 3Z" fill={DARK} />
      <circle cx="18.5" cy="16.5" r="4" fill={DARK} />
      <path d="M18.5 12.8 17.3 11m1.2 1.8 1.2-1.8" stroke={INK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodFruitMand(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 8.5c.9-.6 2-1.1 3.3-1.1 2.3 0 3.7 1.7 3.7 4 0 3.4-2.2 7.6-4.5 7.6-.9 0-1.7-.6-2.5-.6s-1.6.6-2.5.6C5.2 19 3 14.8 3 11.4c0-2.3 1.4-4 3.7-4 1.3 0 2.4.5 3.3 1.1Z" />
      <path d="M10 8c-.15-1.5.6-2.8 2-3.4.3 1.5-.4 2.9-2 3.4Z" fill={DARK} />
      <circle cx="17.5" cy="16" r="4.5" fill={DARK} />
      <path d="M17.5 11.5v-2" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Uitbreiding: zuivel ---------- */

export function FoodKarnemelk(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 8.5 9 4h6l2 4.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" />
      <path d="M9 4h6l2 4.5H7Z" fill={DARK} />
      <rect x="7" y="12" width="10" height="4.5" fill={CREAM} />
    </Svg>
  );
}

export function FoodSlagroom(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 13h16l-1.2 6a3 3 0 0 1-3 2.4H8.2a3 3 0 0 1-3-2.4Z" />
      <path d="M8 12.5c-2 0-3-1.3-2.4-2.8C4 9 4.3 6.8 6 6.3c.3-1.8 2.4-2.6 3.8-1.5C10.5 3.6 12 3 13.2 3.8c1.7-.6 3.4.5 3.4 2.2 1.5.6 1.8 2.5.7 3.6.7 1.4-.3 2.9-2.3 2.9Z" fill={CREAM} stroke={DARK} strokeWidth="1" />
    </Svg>
  );
}

export function FoodVla(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 4h8v3l2 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10l2-3Z" />
      <rect x="8.5" y="4" width="7" height="2" fill={DARK} />
      <path d="M6 13c1.5 1 3 .3 4-.5s2.8-1 4 0 2.7 1 4 .3" stroke={CREAM} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Uitbreiding: vlees ---------- */

export function FoodSpek(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 4c3 2 3 5 0 7s-3 5 0 7 6 2 8 0 1-4 4-5 5-3 4-6-4-4-7-2-6 1-9-1Z" />
      <path d="M6.5 6.5c2 1.2 2 3.5.3 5.2-1.4 1.4-1.4 3.2 0 4.6" stroke={CREAM} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M10.5 7.2c1.5.4 3.2 0 4.6-1" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Uitbreiding: groente ---------- */

export function FoodSla(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 13c0-4.5 4-8.5 9-8.5s9 4 9 8.5c0 3.5-3 6.5-9 6.5S3 16.5 3 13Z" />
      <path d="M7 17c-1-3 0-6.5 2.5-9M12 18V8.5M17 17c1-3 0-6.5-2.5-9" stroke={CREAM} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodKomkommer(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="0.5" y="9.5" width="20" height="6.2" rx="3.1" transform="rotate(-32 10.5 12.5)" />
      <path d="M18.5 5.5 20.5 3.5" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5.5 16.5c3.5-1 7-3.2 9.5-6M7.5 18.5c3.5-1 7-3.2 9.5-6" stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodPaprika(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 7.5C5.5 8.5 4 11 4 14c0 4.5 3.5 8 8 8s8-3.5 8-8c0-3-1.5-5.5-4-6.5-1.2-.6-2.6-.6-4 0-1.4-.6-2.8-.6-4 0Z" />
      <path d="M12 7V4.5c0-1 .8-2 2-2" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M8.5 10c-1 1-1.6 2.4-1.6 4" stroke={CREAM} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodUi(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="14" r="8" />
      <path d="M12 6c-1-1.2-1.2-2.5-.6-4M12 6c1-1.2 1.2-2.5.6-4M12 6V2" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8.5 9.5c-1.8 2.5-1.8 6.5 0 9M15.5 9.5c1.8 2.5 1.8 6.5 0 9" stroke={CREAM} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodKnoflook(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5c1 2 4.5 3 6 5.5 1.6 2.7.8 6.5-1.5 8.5-2.5 2.2-6.5 2.2-9 0-2.3-2-3.1-5.8-1.5-8.5C7.5 8 11 7 12 5Z" />
      <path d="M12 5c-.3-1.3-.2-2.3.5-3.5" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M12 8.5V20M9 10c-1.2 2.5-1.2 6.5 0 9M15 10c1.2 2.5 1.2 6.5 0 9" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodPrei(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 11h5V20a2.5 2.5 0 0 1-5 0Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M9.5 12C6.5 9.5 5 6 5.5 2c2.5 1.5 4.5 3.5 5.5 6.5C11.5 6 13 4 15.5 2.5 17 6 16 10 14.5 12c-1.5 1.3-3.5 1.3-5 0Z" fill={DARK} />
      <path d="M12 13.5V19" stroke={DARK} strokeWidth="1.1" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodBroccoli(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8.5" r="4.2" />
      <circle cx="15.5" cy="7.5" r="3.8" />
      <circle cx="17" cy="12.5" r="3.2" />
      <circle cx="6.5" cy="13" r="3" />
      <circle cx="12" cy="11" r="4" />
      <path d="M10.5 15 9.5 21h5l-1-6" fill={DARK} />
    </Svg>
  );
}

export function FoodBloemkool(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="9" r="4.2" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <circle cx="16" cy="8.5" r="3.8" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <circle cx="12" cy="11.5" r="4.2" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <path d="M4.5 12c-1.5 2.5 0 5.5 2.5 5.5h10c2.5 0 4-3 2.5-5.5" />
      <path d="M7 17.5 8 20h8l1-2.5" />
    </Svg>
  );
}

export function FoodBiet(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 20c-.3 1.2-.2 2.2.5 3.2" stroke={DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M10.5 6.5C9 4.5 9 2.5 10 1c1.5 1 2.2 2.5 2 4.5M13.5 6.5c.3-2 1.3-3.4 3-4 .5 1.8 0 3.5-1.5 5" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="9.5" cy="11.5" r="1.3" fill={CREAM} opacity="0.7" />
    </Svg>
  );
}

export function FoodSperzieboon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="9" width="15" height="3.4" rx="1.7" transform="rotate(20 10 11)" />
      <rect x="5" y="13" width="15" height="3.4" rx="1.7" transform="rotate(12 12 15)" />
      <rect x="4" y="17.5" width="14" height="3.2" rx="1.6" transform="rotate(5 11 19)" />
    </Svg>
  );
}

export function FoodPaddenstoel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 11C2.5 6 6.8 2.5 12 2.5S21.5 6 21.5 11c0 .8-.7 1.5-1.5 1.5H4c-.8 0-1.5-.7-1.5-1.5Z" />
      <path d="M9 12.5h6l-.8 7A2 2 0 0 1 12.2 21.5h-.4a2 2 0 0 1-2-2Z" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <circle cx="8" cy="7.5" r="1.2" fill={CREAM} />
      <circle cx="14.5" cy="6.5" r="1" fill={CREAM} />
    </Svg>
  );
}

export function FoodKruiden(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 14h10l-1 7a1.5 1.5 0 0 1-1.5 1.3h-5A1.5 1.5 0 0 1 8 21Z" fill={DARK} />
      <path d="M12 14V5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12 8c-2 0-3.5-1.3-4-3.5C10 4 11.5 5 12 7c.5-2 2-3 4-2.5-.5 2.2-2 3.5-4 3.5Z" />
      <path d="M12 12c-1.6 0-2.8-1-3.2-2.8 1.6-.4 2.8.4 3.2 2 .4-1.6 1.6-2.4 3.2-2-.4 1.8-1.6 2.8-3.2 2.8Z" />
    </Svg>
  );
}

export function FoodPlant(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 15h10l-1.2 6a1.5 1.5 0 0 1-1.5 1.2H9.7a1.5 1.5 0 0 1-1.5-1.2Z" fill={DARK} />
      <path d="M12 15V9" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12 10C10 10 8.3 8.6 8 6.3c2.3-.3 4 .9 4 3.2 0-2.3 1.7-3.5 4-3.2-.3 2.3-2 3.7-4 3.7Z" />
    </Svg>
  );
}

/* ---------- Uitbreiding: fruit ---------- */

export function FoodDruiven(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="10" r="3" />
      <circle cx="15" cy="10" r="3" />
      <circle cx="6.8" cy="14.5" r="3" />
      <circle cx="12" cy="14" r="3.2" />
      <circle cx="17.2" cy="14.5" r="3" />
      <circle cx="9.5" cy="18.5" r="2.8" />
      <circle cx="14.5" cy="18.5" r="2.8" />
      <circle cx="12" cy="21" r="2" />
      <path d="M12 7V3.5M12 3.5c1.5-1 3-1.2 4.5-.5" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodBes(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 4c1 4 2.5 7 5 10" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="8.5" cy="9" r="2.6" />
      <circle cx="11" cy="13.5" r="2.6" />
      <circle cx="14" cy="17" r="2.8" />
      <circle cx="17.5" cy="13.5" r="2.4" />
      <circle cx="16" cy="8" r="2.2" />
      <circle cx="8" cy="17.5" r="2.4" />
      <path d="M8.5 8.2v.01M11 12.7v.01M14 16.2v.01" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodBraam(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="10" r="2.6" fill={DARK} />
      <circle cx="15" cy="10" r="2.6" fill={DARK} />
      <circle cx="12" cy="8.5" r="2.6" fill={DARK} />
      <circle cx="8" cy="14" r="2.6" fill={DARK} />
      <circle cx="16" cy="14" r="2.6" fill={DARK} />
      <circle cx="12" cy="13" r="2.8" fill={DARK} />
      <circle cx="10" cy="17.5" r="2.4" fill={DARK} />
      <circle cx="14" cy="17.5" r="2.4" fill={DARK} />
      <circle cx="12" cy="20" r="1.8" fill={DARK} />
      <path d="M12 6 10.5 3M12 6l1.5-3" stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10.5" cy="11.5" r=".8" fill={CREAM} opacity="0.6" />
    </Svg>
  );
}

export function FoodPruim(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13.5" r="8" fill={DARK} />
      <path d="M12 6.5c-.5 2.5-.5 9 0 14" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M12 5.5c0-1.5.8-2.7 2.3-3.5.4 1.6-.3 3-2.3 3.5Z" />
      <circle cx="9" cy="10.5" r="1.5" fill={CREAM} opacity="0.5" />
    </Svg>
  );
}

export function FoodMeloen(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 12a10 10 0 0 0 19 0Z" />
      <path d="M4.5 12a8 8 0 0 0 15 0Z" fill={CREAM} />
      <path d="M12 12v7.5M8 12l1.5 6M16 12l-1.5 6" stroke={DARK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="14.5" r=".7" fill={INK} />
      <circle cx="14" cy="14.5" r=".7" fill={INK} />
    </Svg>
  );
}

/* ---------- Uitbreiding: brood & gebak ---------- */

export function FoodCroissant(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 6c2 0 4.5 1 6.5 3s3 4.5 3 6.5c-1.5 1-3.5 1.2-5.5.5-1-2.5-2.5-4-5-5-.7-2-.5-4 1-5Z" />
      <path d="M12 6C10 6 7.5 7 5.5 9s-3 4.5-3 6.5c1.5 1 3.5 1.2 5.5.5 1-2.5 2.5-4 5-5 .7-2 .5-4-1-5Z" fill={DARK} />
      <path d="M11 11c1.5.8 2.6 2 3.4 3.4" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodStokbrood(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="1" y="9" width="22" height="6.5" rx="3.2" transform="rotate(-18 12 12)" />
      <path d="M8 13.8l2-2.4M12 12.5l2-2.4M16 11.2l2-2.4" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodTaart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 21 12 4l3.5 6.5L21 21Z" />
      <path d="M12 4l3.5 6.5c-1.5 1.5-3 1.5-4.5 0S9 9 7.5 10.5Z" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <circle cx="12" cy="3" r="1.6" fill={DARK} />
      <path d="M9 16.5h7" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodKoek(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21.5 12A9.5 9.5 0 1 1 12 2.5c0 2 1.5 3.5 3.5 3.5 0 2 1.5 3.5 3.5 3.5 1 0 2 .9 2.5 2.5Z" />
      <circle cx="9" cy="9" r="1.2" fill={DARK} />
      <circle cx="8" cy="14.5" r="1.2" fill={DARK} />
      <circle cx="13" cy="16.5" r="1.2" fill={DARK} />
      <circle cx="16.5" cy="13" r="1" fill={DARK} />
    </Svg>
  );
}

/* ---------- Uitbreiding: overig ---------- */

export function FoodMeel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h12l1.5 11a2 2 0 0 1-2 2.3H6.5a2 2 0 0 1-2-2.3Z" />
      <path d="M7.5 8C7 6 8 4 10 3h4c2 1 3 3 2.5 5Z" fill={DARK} />
      <rect x="7.5" y="12.5" width="9" height="4.5" rx="1" fill={CREAM} />
      <path d="M12 13.5v2.5M10.5 14.8h3" stroke={INK} strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodKastanje(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3c3.5 2 7 5 7 9.5 0 3.5-3 6.5-7 6.5s-7-3-7-6.5C5 8 8.5 5 12 3Z" />
      <path d="M6.5 15.5c1.5 2 3.5 3 5.5 3s4-1 5.5-3l-1 3.5c-1.2 1.5-2.8 2.3-4.5 2.3s-3.3-.8-4.5-2.3Z" fill={CREAM} stroke={DARK} strokeWidth="1" />
      <circle cx="12" cy="19" r="1" fill={INK} />
    </Svg>
  );
}

export function FoodMosterd(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 9h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" />
      <rect x="8" y="5.5" width="8" height="3" rx="1" fill={DARK} />
      <rect x="10.5" y="2.5" width="3" height="3" rx="1" fill={DARK} />
      <rect x="8.8" y="12" width="6.4" height="5" rx="1" fill={CREAM} />
    </Svg>
  );
}

export function FoodStroop(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 8.5h11V19a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 19Z" fill={DARK} />
      <rect x="5.5" y="4.5" width="13" height="3.5" rx="1.5" />
      <path d="M9.5 12.5c1.5 1.2 3.5 1.2 5 0" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodCider(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 2h5v4.5c0 1.5 2 2 2 4.5v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-9c0-2.5 2-3 2-4.5Z" />
      <rect x="9.5" y="2" width="5" height="2.5" fill={DARK} />
      <path d="M8.5 13.5h7" stroke={CREAM} strokeWidth="1.3" fill="none" />
      <circle cx="12" cy="17" r="2.2" fill={CREAM} />
      <path d="M12 15.8c-.2-.8.2-1.4 1-1.8" stroke={DARK} strokeWidth=".9" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Vis ---------- */

export function FoodVis(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 12c2.5-4 6.5-6.5 11-6.5 3.5 0 6.5 2.7 8 6.5-1.5 3.8-4.5 6.5-8 6.5-4.5 0-8.5-2.5-11-6.5Z" />
      <path d="M2.5 12 6 8v8Z" fill={DARK} />
      <circle cx="17" cy="10.8" r="1.1" fill={CREAM} />
      <path d="M12 8.5c1.5 2 1.5 5 0 7" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodPaling(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7c4-2.5 8-2 10 .5s1 5.5-1.5 7S7 16 6 18.5c2.5 1.5 6 1.5 9 0 3.5-1.8 6-5.5 6-9.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="4.5" cy="6.2" r="1.7" />
      <circle cx="4.2" cy="5.8" r=".6" fill={CREAM} />
      <path d="M14 20.5c2.5 0 5-1 7-3" stroke={DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodForel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 13.5c2.5-4.5 7-7 11.5-6.5 3.2.3 6 2.5 7.5 5.5-2 3.5-5.3 5.5-8.5 5.5-4 0-8-1.5-10.5-4.5Z" fill={DARK} />
      <path d="M2.5 13.5 5.5 9.5l.5 7.5Z" />
      <circle cx="16.5" cy="11.5" r="1" fill={CREAM} />
      <circle cx="10" cy="12" r=".8" fill={CREAM} opacity="0.7" />
      <circle cx="13" cy="14" r=".8" fill={CREAM} opacity="0.7" />
      <circle cx="8" cy="14.5" r=".7" fill={CREAM} opacity="0.7" />
    </Svg>
  );
}

/* ---------- Extra zuivel & kaas ---------- */

export function FoodGeit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 4C5.5 3 4.5 2 4 .5 6.5.5 8.5 1.5 9.5 3.5M17 4c1.5-1 2.5-2 3-3.5-2.5 0-4.5 1-5.5 3" fill={DARK} />
      <ellipse cx="12" cy="12" rx="7.5" ry="8.5" />
      <ellipse cx="12" cy="16.5" rx="4" ry="4.5" fill={CREAM} />
      <circle cx="9.5" cy="9.5" r="1.1" fill={INK} />
      <circle cx="14.5" cy="9.5" r="1.1" fill={INK} />
      <circle cx="10.8" cy="16" r=".8" fill={INK} />
      <circle cx="13.2" cy="16" r=".8" fill={INK} />
    </Svg>
  );
}

export function FoodKefir(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 2h7v3.5c1.5 1 2.5 2.7 2.5 4.5v9a2.5 2.5 0 0 1-2.5 2.5H8.5A2.5 2.5 0 0 1 6 18.5v-9C6 7.7 7 6 8.5 5Z" />
      <rect x="8.5" y="2" width="7" height="2" fill={DARK} />
      <circle cx="10" cy="13" r="1.1" fill={CREAM} />
      <circle cx="13.5" cy="15.5" r="1.1" fill={CREAM} />
      <circle cx="12" cy="10.5" r="1" fill={CREAM} />
    </Svg>
  );
}

export function FoodBrie(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5a9 9 0 0 1 9 9l-9-1.5Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M21 12.5a9 9 0 1 1-9-9v9Z" />
      <path d="M12 3.5a9 9 0 0 0-9 9 9 9 0 0 0 9 9" fill="none" stroke={DARK} strokeWidth="1" opacity="0.4" />
    </Svg>
  );
}

export function FoodBlauweKaas(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 15.5 21 9.5a1 1 0 0 1 1 .1V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <circle cx="7" cy="16" r="1.2" fill={INK} />
      <circle cx="12" cy="15.2" r="1" fill={INK} opacity="0.7" />
      <circle cx="16.5" cy="13.8" r="1.1" fill={INK} />
      <circle cx="9.8" cy="17.3" r=".7" fill={INK} opacity="0.7" />
    </Svg>
  );
}

/* ---------- Extra vlees ---------- */

export function FoodEend(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 13c0-3 2.5-5 5.5-5 .5-2 2-3.5 4-3.5 2.5 0 4 2 4 4 0 .8-.2 1.5-.6 2.2L20.5 12c-1 4.5-5 7.5-9.5 7.5-3.8 0-7-2.8-7-6.5Z" />
      <path d="M17.5 7.5 21 8.5l-3.2 1.7" fill={DARK} />
      <circle cx="14.8" cy="7" r=".9" fill={CREAM} />
      <path d="M7 13.5c1.5 2 4 3 6.5 2.5" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodKalkoen(p: IconProps) {
  return (
    <Svg {...p}>
      <ellipse cx="11" cy="13" rx="8.5" ry="7.5" />
      <path d="M11 5.5C9 2.5 5.5 1.5 2.5 2.5c1 3 3.5 5 6.5 5.5M11 5.5c.5-3 3-5 6-5.2-.3 3.2-2 5.7-4.5 6.7" fill={DARK} />
      <path d="M16 18.5 18 22M13 20l.5 2.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="11" r="1.4" fill={CREAM} opacity="0.7" />
    </Svg>
  );
}

export function FoodHamburger(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10a8 8 0 0 1 16 0Z" />
      <rect x="3.5" y="11.5" width="17" height="3" rx="1.5" fill={DARK} />
      <path d="M4 16h16v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" />
      <circle cx="9" cy="6.5" r=".8" fill={CREAM} />
      <circle cx="13.5" cy="5.8" r=".8" fill={CREAM} />
    </Svg>
  );
}

export function FoodSaucijs(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="8" width="20" height="7.5" rx="3.7" transform="rotate(-12 12 12)" />
      <path d="M8.2 12.5v.01M12 11.7v.01M15.8 10.9v.01" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
      <path d="M4.5 11.5c-.8-1-.8-2.3 0-3.3M19.5 8.3c.8 1 .8 2.3 0 3.3" stroke={DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodSalami(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="6.5" fill={CREAM} />
      <circle cx="10" cy="10" r="1" fill={DARK} />
      <circle cx="14" cy="11" r=".9" fill={DARK} />
      <circle cx="11" cy="14" r=".9" fill={DARK} />
      <circle cx="14.5" cy="14.5" r=".8" fill={DARK} />
      <circle cx="9" cy="12.5" r=".7" fill={DARK} />
    </Svg>
  );
}

/* ---------- Extra groente ---------- */

export function FoodSpinazie(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21c-1-4 0-8.5 2-12" stroke={DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M14 9C11 9 8.5 6.5 8 3c3.5-.5 6.5 1.5 7.3 4.8Z" />
      <path d="M9 14c-2.5.3-5-1.2-6-3.8 2.8-1 5.5 0 6.8 2.5Z" />
      <path d="M16 15c2.3-.8 5 0 6.3 2.2-2.4 1.5-5.2 1-6.8-1Z" />
    </Svg>
  );
}

export function FoodAndijvie(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 22C7 22 4 19 4 15c0-1.5.5-3 1.3-4C4.5 9.5 5 7.5 6.5 6.5c.2-1.8 1.8-3 3.5-2.7C11 2.6 13 2.6 14 3.8c1.7-.3 3.3.9 3.5 2.7 1.5 1 2 3 1.2 4.5.8 1 1.3 2.5 1.3 4 0 4-3 7-8 7Z" />
      <path d="M12 21v-9M12 15l-3.5-2.5M12 13l3.5-2.5" stroke={CREAM} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodWitlof(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 21c-1.5-4-1.5-9 .5-13C9.5 5.5 10.7 4 12 3c1.3 1 2.5 2.5 3.5 5 2 4 2 9 .5 13Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M12 3c.8 2.5 1.2 4.5 1.2 7M12 3c-.8 2.5-1.2 4.5-1.2 7" stroke={DARK} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M8 21h8" stroke={DARK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodRodeKool(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12.5" r="8.5" fill={DARK} />
      <path d="M12 4.5c-3 2.5-4.5 5.5-4.5 8s1.5 5.5 4.5 8M12 4.5c3 2.5 4.5 5.5 4.5 8s-1.5 5.5-4.5 8M4 11c2.5 1 5 1.5 8 1.5s5.5-.5 8-1.5" stroke={CREAM} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

export function FoodSpitskool(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2.5c4 3 6.5 7.5 6.5 12 0 4-2.8 7-6.5 7s-6.5-3-6.5-7c0-4.5 2.5-9 6.5-12Z" />
      <path d="M12 3.5c-1.5 4-2 8.5-1.2 13M12 3.5c1.5 4 2 8.5 1.2 13" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodSnijboon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20C6 13 10 7 17 3.5c1 .5 1.7 1.2 2 2.5C13 9.5 9 15 7.5 21Z" />
      <path d="M8 16.5c2-4 5-8 9-10.5" stroke={CREAM} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodDoperwt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 6c6-1.5 12 1 15 6.5 1 2 1.3 4 .8 6-6 1.5-12-1-15-6.5C4 10 3.5 8 4 6Z" />
      <circle cx="9" cy="10.5" r="1.9" fill={CREAM} />
      <circle cx="13" cy="12.5" r="1.9" fill={CREAM} />
      <circle cx="16.8" cy="14.5" r="1.9" fill={CREAM} />
    </Svg>
  );
}

export function FoodTuinboon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4c5.5-1 10.5 1.5 12.5 6.5.8 2.2 1 4.5.3 6.8-5.5 1-10.5-1.5-12.5-6.5C4.5 8.5 4.3 6.3 5 4Z" fill={DARK} />
      <ellipse cx="9" cy="9" rx="2" ry="1.6" fill={CREAM} transform="rotate(25 9 9)" />
      <ellipse cx="13.5" cy="12.5" rx="2" ry="1.6" fill={CREAM} transform="rotate(25 13.5 12.5)" />
    </Svg>
  );
}

export function FoodMais(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 3.5h6c.5 5 .5 10-1 16.5h-4C8.5 13.5 8.5 8.5 9 3.5Z" />
      <path d="M10 6h4M9.7 9h4.6M9.6 12h4.8M9.8 15h4.4M10.2 18h3.6" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
      <path d="M9 6C6.5 7.5 5 10.5 5 14c1.8-.5 3.2-1.8 4-3.5M15 6c2.5 1.5 4 4.5 4 8-1.8-.5-3.2-1.8-4-3.5" fill={DARK} />
    </Svg>
  );
}

export function FoodPastinaak(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 7c2.5-1 5 0 6 2.5.8 2.2-.2 4.5-2.5 7L9 21c-.8.8-2-.2-1.5-1.2l2.7-5.3C9 12 9 9 10 7Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M12 6.5c-.3-2 .5-3.7 2.2-4.8.5 1.7 0 3.4-1.2 4.8 1.7-1 3.5-1.2 5.2-.5-1.2 1.6-3 2.3-5 2Z" fill={DARK} />
    </Svg>
  );
}

export function FoodKnolselderij(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 13c0-4.5 3.5-8 7.5-8s7.5 3.5 7.5 8c0 4-3 7.5-7.5 7.5S4.5 17 4.5 13Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M8 18.5v.01M11 19.5v.01M14.5 18.8v.01M6.5 15v.01M17.5 15.5v.01" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 5.5V3M12 5.2V2M14 5.5V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodSnoeptomaat(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="15" r="4.5" />
      <circle cx="16.5" cy="14" r="3.8" />
      <circle cx="12" cy="8" r="4" />
      <path d="M12 4.5 11 2.5m1 2 1.5-1.8" stroke={DARK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="10.8" cy="7" r="1" fill={CREAM} opacity="0.8" />
      <circle cx="6.8" cy="13.8" r="1" fill={CREAM} opacity="0.8" />
    </Svg>
  );
}

/* ---------- Extra fruit ---------- */

export function FoodBlauweBes(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8.5" cy="10" r="4.2" fill={INK} />
      <circle cx="16" cy="12" r="4" fill={DARK} />
      <circle cx="11" cy="16.5" r="4.2" fill={INK} />
      <path d="M8.5 7.5 7.5 6m1 1.5 1.2-1.4" stroke={DARK} strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="7.3" cy="9" r=".9" fill={CREAM} opacity="0.6" />
      <circle cx="9.8" cy="15.5" r=".9" fill={CREAM} opacity="0.6" />
    </Svg>
  );
}

export function FoodKruisbes(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13" r="7.5" fill={CREAM} stroke={DARK} strokeWidth="1.3" />
      <path d="M6 10.5c3.8-1.5 8.2-1.5 12 0M6 15.5c3.8 1.5 8.2 1.5 12 0M12 5.5v15" stroke={DARK} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M12 5.5 11 3" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Extra brood & gebak ---------- */

export function FoodVolkoren(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5C6.8 4.5 3.5 6.6 3.5 9.6c0 1.5.9 2.7 2 3.2v6.4a1.4 1.4 0 0 0 1.4 1.4h10.2a1.4 1.4 0 0 0 1.4-1.4v-6.4c1.1-.5 2-1.7 2-3.2 0-3-3.3-5.1-8.5-5.1Z" fill={DARK} />
      <circle cx="9" cy="9" r=".8" fill={CREAM} />
      <circle cx="13" cy="8" r=".8" fill={CREAM} />
      <circle cx="15.5" cy="10.5" r=".8" fill={CREAM} />
      <circle cx="11" cy="13" r=".8" fill={CREAM} />
    </Svg>
  );
}

export function FoodSpelt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21c-.5-5 0-10 1.5-14" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M13.5 7C12 5.5 11.7 3.5 12.7 1.5c1.8 1 2.5 3 2 5.2ZM11.5 11C9.8 10.3 8.8 8.6 9 6.4c2 .5 3.2 2.2 3.3 4.4ZM15 10.5c.3-2.2 1.5-3.9 3.5-4.4.2 2.2-.8 3.9-2.5 4.6ZM10.8 15c-1.7-.7-2.7-2.4-2.5-4.6 2 .5 3.2 2.2 3.3 4.4ZM15.6 14.7c.3-2.2 1.5-3.9 3.5-4.4.2 2.2-.8 3.9-2.5 4.6Z" />
    </Svg>
  );
}

export function FoodRogge(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="8" width="16" height="11" rx="3" fill={INK} />
      <ellipse cx="12" cy="8.5" rx="8" ry="2.5" fill={DARK} />
      <path d="M8 13h8M9.5 16h5" stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

export function FoodKrentenbrood(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5C6.8 4.5 3.5 6.6 3.5 9.6c0 1.5.9 2.7 2 3.2v6.4a1.4 1.4 0 0 0 1.4 1.4h10.2a1.4 1.4 0 0 0 1.4-1.4v-6.4c1.1-.5 2-1.7 2-3.2 0-3-3.3-5.1-8.5-5.1Z" />
      <circle cx="8.5" cy="9.5" r=".9" fill={INK} />
      <circle cx="12.5" cy="8" r=".9" fill={INK} />
      <circle cx="15.5" cy="11" r=".9" fill={INK} />
      <circle cx="10.5" cy="13" r=".9" fill={INK} />
      <circle cx="14" cy="15.5" r=".9" fill={INK} />
      <circle cx="8" cy="16.5" r=".9" fill={INK} />
    </Svg>
  );
}

export function FoodOntbijtkoek(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9c0-2 3.5-3.5 8-3.5S20 7 20 9v7c0 2-3.5 3.5-8 3.5S4 18 4 16Z" fill={DARK} />
      <ellipse cx="12" cy="9" rx="8" ry="3.5" fill="currentColor" />
      <path d="M7 13v4M10 14v4M14 14v4M17 13v4" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function FoodAppeltaart(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 12c0-2 4-3.5 9-3.5s9 1.5 9 3.5v3c0 3-4 5.5-9 5.5S3 18 3 15Z" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" fill={CREAM} />
      <path d="M5.5 11.5 9 12.7M18.5 11.5 15 12.7M12 10.5v2.8M7.5 14.5l2-1M16.5 14.5l-2-1" stroke={DARK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/* ---------- Extra zoet ---------- */

export function FoodStroopwafel(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 8.5l13 7M18.5 8.5l-13 7M8.5 5.5l7 13M15.5 5.5l-7 13M12 3v18M3 12h18" stroke={DARK} strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <circle cx="12" cy="12" r="9" fill="none" stroke={DARK} strokeWidth="1.4" />
    </Svg>
  );
}

export function FoodHoningraat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3.5h4l2 3.5-2 3.5H8L6 7ZM14 10.5h4l2 3.5-2 3.5h-4l-2-3.5ZM8 13.5h4l-2 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 17c1.5 2.5 4 4 6.5 4" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="15" cy="20" r="1.4" fill={DARK} />
    </Svg>
  );
}

export function FoodChocolade(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" fill={INK} />
      <path d="M4 9h16M4 15h16M9.3 3v18M14.6 3v18" stroke={CREAM} strokeWidth="1" opacity="0.5" />
      <rect x="4" y="3" width="8" height="6" fill={DARK} />
    </Svg>
  );
}

/* ---------- Extra dranken ---------- */

export function FoodAppelsap(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 2h6v3.5c1.3.9 2 2.3 2 4V19a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19V9.5c0-1.7.7-3.1 2-4Z" />
      <rect x="9" y="2" width="6" height="2" fill={DARK} />
      <circle cx="12" cy="14" r="3.2" fill={CREAM} />
      <path d="M12 11.8c-.1-.9.3-1.5 1-1.9" stroke={DARK} strokeWidth=".9" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="14.4" r="1.7" fill={DARK} opacity="0.25" />
    </Svg>
  );
}

export function FoodPerensap(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 2h6v3.5c1.3.9 2 2.3 2 4V19a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19V9.5c0-1.7.7-3.1 2-4Z" fill={DARK} />
      <rect x="9" y="2" width="6" height="2" fill={INK} />
      <path d="M12.8 11.5c1.2.5 2 1.6 2 3a2.9 2.9 0 0 1-5.8 0c0-1.4.8-2.5 2-3 .4-.2.5-.6.5-1.2h.9c0 .6.1 1 .4 1.2Z" fill={CREAM} />
    </Svg>
  );
}

export function FoodSiroop(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 8.5h7l1 11a2 2 0 0 1-2 2.2h-5a2 2 0 0 1-2-2.2Z" />
      <path d="M9.5 4.5h5l.5 4h-6Z" fill={DARK} />
      <rect x="10" y="2.5" width="4" height="2" rx="1" fill={DARK} />
      <path d="M9 13h6.5" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodThee(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9h13v6a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z" />
      <path d="M17 10.5h1.5a2.75 2.75 0 0 1 0 5.5H16.5" fill="none" stroke={DARK} strokeWidth="1.8" />
      <path d="M10.5 13.5c-1.5-.5-2.4-1.8-2.4-3.6 1.9.1 3.1 1.3 3.4 3.1.8-1.5 2.2-2.3 4-2.2-.4 1.9-1.8 3-3.8 3" fill={CREAM} />
      <path d="M8 6c-.7-.8.7-1.5 0-2.7M12 6c-.7-.8.7-1.5 0-2.7" stroke={DARK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodKoffie(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8.5h9l-1 11.5a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8Z" fill={DARK} />
      <ellipse cx="10.5" cy="8.5" rx="4.5" ry="1.5" fill={INK} />
      <ellipse cx="16.5" cy="6" rx="2.2" ry="3" transform="rotate(30 16.5 6)" />
      <path d="M16.5 4.2c-.5 1.2-.5 2.4 0 3.6" stroke={CREAM} strokeWidth=".9" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="9" rx="1.9" ry="2.6" transform="rotate(55 20 9)" />
    </Svg>
  );
}

/* ---------- Extra overig ---------- */

export function FoodOlie(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 2.5h4v3l2 2.5V19a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 8 19V8l2-2.5Z" />
      <rect x="10" y="2.5" width="4" height="1.8" fill={DARK} />
      <path d="M9 12h6v6H9Z" fill={CREAM} />
      <circle cx="12" cy="15" r="1.6" fill={DARK} opacity="0.5" />
    </Svg>
  );
}

export function FoodAzijn(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10.5 2h3v4c2 1.5 3.5 4 3.5 7v6a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19v-6c0-3 1.5-5.5 3.5-7Z" fill={DARK} />
      <rect x="10.5" y="2" width="3" height="1.8" fill={INK} />
      <path d="M8.5 14h7" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodPesto(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 8h11v11a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 19Z" fill={DARK} />
      <rect x="5.5" y="4.5" width="13" height="3.2" rx="1.4" />
      <path d="M10 13.5c-1.3-.4-2.1-1.5-2.1-3 1.6 0 2.7 1 3.1 2.5.5-1.4 1.6-2.3 3.2-2.2-.2 1.6-1.2 2.6-2.9 2.7" fill={CREAM} />
    </Svg>
  );
}

export function FoodSoep(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 11h18v1.5c0 4.5-4 8-9 8s-9-3.5-9-8Z" />
      <path d="M3 11h18" stroke={DARK} strokeWidth="1.2" />
      <path d="M8 8c-.8-1 .8-1.8 0-3.2M12 8c-.8-1 .8-1.8 0-3.2M16 8c-.8-1 .8-1.8 0-3.2" stroke={INK} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function FoodZuurkool(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 7.5h11V19a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 19Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <rect x="5.5" y="4" width="13" height="3.2" rx="1.4" />
      <path d="M8.5 11c2.3 1 4.7 1 7 0M8.5 14c2.3 1 4.7 1 7 0M8.5 17c2.3 1 4.7 1 7 0" stroke={DARK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodHazelnoot(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="14" r="5.5" />
      <path d="M9 8.5c-2 0-3.6-1-4.5-2.8C6.3 5 8.1 5.4 9.4 6.8 9.2 5 10 3.3 11.5 2.3c.9 1.7.6 3.6-.6 5.1" fill={DARK} />
      <circle cx="16.5" cy="15.5" r="4.5" fill={DARK} />
      <path d="M16.5 11c-1 .8-1.6 2-1.6 3.3" stroke={CREAM} strokeWidth="1" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Supermarkt (geen producent-matching) ---------- */

export function FoodPasta(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12c0-1 6-1.5 7-1.5s7 .5 7 1.5l-1.5 8a2 2 0 0 1-2 1.6h-7a2 2 0 0 1-2-1.6Z" />
      <path d="M6.5 10.5C7 6.5 9 3.5 12 2c3 1.5 5 4.5 5.5 8.5" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 10.2C9.8 7.4 10.6 5 12 3.4c1.4 1.6 2.2 4 2.5 6.8" fill="none" stroke={DARK} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 15.5h8" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodRijst(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5.5 7h13l1 12a2 2 0 0 1-2 2.2h-11a2 2 0 0 1-2-2.2Z" />
      <path d="M7 7c0-2.2 2.2-4 5-4s5 1.8 5 4Z" fill={DARK} />
      <ellipse cx="9.5" cy="13" rx=".9" ry="1.5" fill={CREAM} transform="rotate(20 9.5 13)" />
      <ellipse cx="13" cy="15.5" rx=".9" ry="1.5" fill={CREAM} transform="rotate(-15 13 15.5)" />
      <ellipse cx="14.5" cy="11.5" rx=".9" ry="1.5" fill={CREAM} transform="rotate(35 14.5 11.5)" />
    </Svg>
  );
}

export function FoodWcPapier(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 5h10c2.2 0 4 2.7 4 6s-1.8 6-4 6H7c-2.2 0-4-2.7-4-6s1.8-6 4-6Z" />
      <ellipse cx="17" cy="11" rx="3.2" ry="5" fill={CREAM} />
      <ellipse cx="17" cy="11" rx="1.2" ry="2" fill={DARK} />
      <path d="M3.5 13.5h9V21h-2" fill="none" stroke={DARK} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodSchoonmaak(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 10h7l1 9.5a2 2 0 0 1-2 2.2h-5a2 2 0 0 1-2-2.2Z" />
      <path d="M10 10V7h3" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 5.5h4.5a1.5 1.5 0 0 1 0 3H16" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 4.5v.01M21 7v.01M20.5 10v.01" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 14h5.5" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodLuier(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h16a1 1 0 0 1 1 1v3c0 5-3.8 9-8.5 9h-1C6.8 20 3 16 3 11V8a1 1 0 0 1 1-1Z" />
      <path d="M3 10c2.5 0 4.5 1.8 5 4.5M21 10c-2.5 0-4.5 1.8-5 4.5" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="9.5" r="1" fill={CREAM} />
    </Svg>
  );
}

export function FoodTandpasta(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="10" width="15" height="7" rx="2" transform="rotate(-8 10 13.5)" />
      <path d="M18.5 9.5 21 9v4.5l-2.5-.5Z" fill={DARK} />
      <path d="M6 13.5c1.5-1 3-1 4.5 0s3 1 4.5 0" stroke={CREAM} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodShampoo(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 9h7a1.5 1.5 0 0 1 1.5 1.5V19a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19v-8.5A1.5 1.5 0 0 1 8.5 9Z" />
      <rect x="10.5" y="5.5" width="3" height="3.5" fill={DARK} />
      <path d="M10.5 5.5h5.5" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 14h7" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodZeep(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="10" width="13" height="8" rx="3" />
      <path d="M8 14h5" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="17" cy="6.5" r="2" fill="none" stroke={DARK} strokeWidth="1.4" />
      <circle cx="20.5" cy="9.5" r="1.2" fill="none" stroke={DARK} strokeWidth="1.2" />
      <circle cx="14" cy="4.5" r="1" fill="none" stroke={DARK} strokeWidth="1.1" />
    </Svg>
  );
}

export function FoodWasmiddel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h10a2 2 0 0 1 2 2v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 4 19v-9a2 2 0 0 1 2-2Z" />
      <path d="M16.5 9.5 19 7.5a1.6 1.6 0 0 0-2-2.4L14.5 7" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11" cy="14.5" r="3.2" fill={CREAM} />
      <path d="M9.5 14.5c.8-1 2.2-1 3 0" stroke={DARK} strokeWidth="1" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodVuilniszak(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 8.5c-1.5 3-2 6.5-1.5 10 .2 1.5 1.5 2.5 3 2.5h7c1.5 0 2.8-1 3-2.5.5-3.5 0-7-1.5-10Z" fill={INK} />
      <path d="M9 8.5c-.5-1.5 0-2.8 1-3.5L9 3h6l-1 2c1 .7 1.5 2 1 3.5Z" fill={DARK} />
      <path d="M8.5 13c2.2.8 4.8.8 7 0" stroke={CREAM} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function FoodKeukenrol(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="13" height="16" rx="6.5" />
      <ellipse cx="10.5" cy="12" rx="2.2" ry="3.5" fill={CREAM} />
      <path d="M17 6.5h3.5v12.5H14" fill="none" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodSuiker(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6.5h12l1.2 12.5a2 2 0 0 1-2 2.2H6.8a2 2 0 0 1-2-2.2Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M8 6.5C8 4.3 9.8 2.8 12 2.8s4 1.5 4 3.7Z" fill={DARK} />
      <rect x="8.5" y="11" width="3" height="3" rx=".6" fill="currentColor" />
      <rect x="12.8" y="13.5" width="3" height="3" rx=".6" fill="currentColor" opacity="0.7" />
    </Svg>
  );
}

export function FoodZout(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 8.5h6l1.5 10A2 2 0 0 1 14.5 21h-5a2 2 0 0 1-2-2.5Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <path d="M9.5 8.5c0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5Z" />
      <path d="M11 3.5v.01M12.5 2.5v.01M14 3.8v.01" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 13.5v.01M12.5 15v.01M11 17.5v.01M14 12.5v.01" stroke={DARK} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodPeper(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 9h7c1 4 1 8 0 12h-7c-1-4-1-8 0-12Z" fill={INK} />
      <path d="M9.5 9c-.5-2 .5-4 2.5-4.5C14 5 15 6.9 14.5 9Z" fill={DARK} />
      <circle cx="12" cy="3.5" r="1.4" />
      <path d="M9.5 13.5h5M9.5 16.5h5" stroke={CREAM} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function FoodPindakaas(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 8h11v11a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 19Z" />
      <rect x="5.5" y="4.5" width="13" height="3.2" rx="1.4" fill={INK} />
      <path d="M9.5 14.5c0-1.4 1.1-2.5 2.5-2.5.6-1 2-1 2.6 0 .8.4 1.4 1.3 1.4 2.3a2.6 2.6 0 0 1-2.7 2.6h-1.3a2.5 2.5 0 0 1-2.5-2.4Z" fill={DARK} />
    </Svg>
  );
}

export function FoodHagelslag(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <rect x="7.5" y="6" width="9" height="7" rx="1" fill={CREAM} />
      <rect x="9" y="8" width="2.5" height="1" rx=".5" fill={INK} transform="rotate(25 10 8.5)" />
      <rect x="12.5" y="9.5" width="2.5" height="1" rx=".5" fill={DARK} transform="rotate(-20 13.7 10)" />
      <rect x="10" y="10.8" width="2.5" height="1" rx=".5" fill={INK} transform="rotate(5 11 11.3)" />
      <path d="M8 16.5h8M8 18.5h5" stroke={CREAM} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

export function FoodChips(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 3.5h10c.8 4 1.2 8 1 12.5-.1 2.8-1 5-2.5 5.5h-7c-1.5-.5-2.4-2.7-2.5-5.5-.2-4.5.2-8.5 1-12.5Z" fill={DARK} />
      <path d="M7 3.5h10l-.4 2.5H7.4Z" fill={INK} />
      <circle cx="12" cy="13" r="3.6" fill={CREAM} />
      <path d="M10 13c.5-1.5 2-2.3 3.5-1.8" stroke={DARK} strokeWidth="1" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodMuesli(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 12h17v1c0 4-3.8 7.5-8.5 7.5S3.5 17 3.5 13Z" />
      <path d="M6 9.5c1-.8 2.3-.8 3.3 0s2.4.8 3.4 0 2.4-.8 3.4 0 2 .8 3 0" stroke={DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="8.5" cy="6.5" r="1" fill={DARK} />
      <circle cx="13" cy="5.5" r="1" fill={INK} />
      <circle cx="16.5" cy="7" r="1" fill={DARK} />
    </Svg>
  );
}

export function FoodWater(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 2.5h4V6c1.3 1 2 2.5 2 4.5V19a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 8 19v-8.5C8 8.5 8.7 7 10 6Z" fill={CREAM} stroke={DARK} strokeWidth="1.2" />
      <rect x="10" y="2.5" width="4" height="1.8" fill="currentColor" />
      <path d="M9.5 11.5c1.6-.8 3.4-.8 5 0M9.5 14.5c1.6-.8 3.4-.8 5 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function FoodFrisdrank(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 6h8a1 1 0 0 1 1 1l-.8 13a2 2 0 0 1-2 1.9h-4.4a2 2 0 0 1-2-1.9L7 7a1 1 0 0 1 1-1Z" />
      <ellipse cx="12" cy="6" rx="4" ry="1.4" fill={DARK} />
      <path d="M12 5.8 14.5 2" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.2 11h7.6" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10.5" cy="15" r=".8" fill={CREAM} />
      <circle cx="13.5" cy="17" r=".8" fill={CREAM} />
    </Svg>
  );
}
