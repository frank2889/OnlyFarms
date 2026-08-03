import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function EggIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 22c-4.97 0-8-2.582-8-7 0-4.97 4-13 8-13s8 8.03 8 13c0 4.418-3.03 7-8 7Z" />
    </Svg>
  );
}

export function MilkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 2h8" />
      <path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2" />
      <path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0" />
    </Svg>
  );
}

export function CheeseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 13 22 8v11H2Z" />
      <path d="M7 15.5v.01M12 16.5v.01M16.5 13v.01" />
    </Svg>
  );
}

export function MeatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12.5" cy="8.5" r="2.5" />
      <path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z" />
      <path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5" />
    </Svg>
  );
}

export function CarrotIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46" />
      <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z" />
      <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z" />
    </Svg>
  );
}

export function AppleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </Svg>
  );
}

export function PotatoIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-18 12 12)" />
      <path d="M9 11v.01M13 14v.01M14.5 10v.01" />
    </Svg>
  );
}

export function HoneyIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M12 9v4" />
    </Svg>
  );
}

export function LeafIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Svg>
  );
}

export function VendingIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <rect x="8" y="6" width="5" height="5" rx="1" />
      <path d="M16 6v.01M16 9v.01M8 16h8" />
    </Svg>
  );
}

export function MapPinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export function MapIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15M9 3.236v15" />
    </Svg>
  );
}

export function SproutIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Svg>
  );
}

export function BreadIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4C7 4 4 6 4 9c0 1.5 1 2.6 2 3v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7c1-.4 2-1.5 2-3 0-3-3-5-8-5Z" />
    </Svg>
  );
}

export function BeerIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
      <path d="M9 12v6M13 12v6" />
      <path d="M5 8v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8" />
      <path d="M5 8h10V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2Z" />
    </Svg>
  );
}

export function WineIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 22h8M12 15v7M7 10h10" />
      <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
    </Svg>
  );
}

export function JarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3h8" />
      <path d="M7 3c0 2-2 3-2 5v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8c0-2-2-3-2-5" />
      <path d="M5 13h14" />
    </Svg>
  );
}

export function FlowerIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9a3 3 0 1 1 3-3M15 12a3 3 0 1 1 3 3M12 15a3 3 0 1 1-3 3M9 12a3 3 0 1 1-3-3" />
    </Svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h14M12 5v14" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </Svg>
  );
}

export function ShareIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </Svg>
  );
}

export function ListIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function StoreIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m2 7 2-4h16l2 4" />
      <path d="M2 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7" />
      <path d="M4 11v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  );
}

export function RouteIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 11 22 2l-9 19-2-8Z" />
    </Svg>
  );
}

export function UserIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
    </Svg>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="17" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  );
}

export function PencilIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </Svg>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function XIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

export function ChefHatIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 13.5a4 4 0 0 1-1-7.87 5 5 0 0 1 9.9-.63A4 4 0 0 1 17 13.5" />
      <path d="M7 13v6h10v-6" />
      <path d="M7 16.5h10" />
    </Svg>
  );
}

export function BellIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function CardsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="7.5" y="4" width="12" height="16" rx="2" transform="rotate(6 13.5 12)" />
      <path d="M8.5 6.5 5.9 7.2a2 2 0 0 0-1.4 2.4l2.6 9.7" />
    </Svg>
  );
}
