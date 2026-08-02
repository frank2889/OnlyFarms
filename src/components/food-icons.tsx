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
