// Openingstijden-teksten (mix van notaties: "Th 13:00-17:00", "Tu,Sa 08:00-17:00",
// "Mo-We, Fr 09:00-18:00", "Dagelijks 08:00-20:00") omzetten naar wat je nu wilt
// weten: nu open, opent om, of opent morgen/op dag X. Plus een marktdagen-samenvatting.

type Interval = { day: number; start: number; end: number }; // dag 0=zondag, tijden in minuten

const DAY_MAP: Record<string, number> = {
  zo: 0, su: 0, sun: 0,
  ma: 1, mo: 1, mon: 1,
  di: 2, tu: 2, tue: 2,
  wo: 3, we: 3, wed: 3,
  do: 4, th: 4, thu: 4,
  vr: 5, fr: 5, fri: 5,
  za: 6, sa: 6, sat: 6,
};

const DAY_NAMES = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const DAY_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];

const TIME = "(\\d{1,2})[:.](\\d{2})";

function toMinutes(h: string, m: string): number {
  return Number(h) * 60 + Number(m);
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseDaySpec(spec: string): number[] {
  const cleaned = spec.replace(/:\s*$/, "").trim();
  if (!cleaned || /(dagelijks|daily|elke dag|iedere dag)/.test(cleaned)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const days = new Set<number>();
  for (const token of cleaned.split(",")) {
    const part = token.trim();
    const range = part.match(/([a-z]{2,3})\s*[-–]\s*([a-z]{2,3})$/);
    if (range && DAY_MAP[range[1]] !== undefined && DAY_MAP[range[2]] !== undefined) {
      for (let d = DAY_MAP[range[1]]; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === DAY_MAP[range[2]]) break;
      }
      continue;
    }
    const single = part.match(/([a-z]{2,3})$/);
    if (single && DAY_MAP[single[1]] !== undefined) days.add(DAY_MAP[single[1]]);
  }
  return days.size ? [...days] : [0, 1, 2, 3, 4, 5, 6];
}

export function parseHours(text: string): Interval[] {
  const intervals: Interval[] = [];
  const lower = text.toLowerCase();

  // Segmenten: ';' scheidt altijd; ',' alleen als er al een tijdvak in de groep zit
  // ("tu, sa 08:00-17:00" blijft een groep; "ma-vr 09:00-17:30, za 9.00-16.00" splitst)
  const segments: string[] = [];
  for (const bySemi of lower.split(";")) {
    let current = "";
    for (const token of bySemi.split(",")) {
      current = current ? `${current},${token}` : token;
      if (new RegExp(`${TIME}\\s*[-–]\\s*${TIME}`).test(current)) {
        segments.push(current);
        current = "";
      }
    }
    if (current.trim()) segments.push(current);
  }

  for (const segment of segments) {
    const seg = segment.trim();
    if (!seg) continue;

    if (/(dagelijks|daily|24\/7)\s*(geopend|open)?$/.test(seg)) {
      for (let d = 0; d < 7; d++) intervals.push({ day: d, start: 0, end: 24 * 60 });
      continue;
    }

    const time = seg.match(new RegExp(`${TIME}\\s*[-–]\\s*${TIME}`));
    if (!time || time.index === undefined) continue;
    const start = toMinutes(time[1], time[2]);
    const end = toMinutes(time[3], time[4]);
    // dag-specificatie is alles voor de tijd: "ma-vr", "tu,sa", "mo-we, fr", "dagelijks"
    const daySpec = seg.slice(0, time.index);
    for (const d of parseDaySpec(daySpec)) intervals.push({ day: d, start, end });
  }
  return intervals;
}

/** Korte marktdagen-weergave: "di & za" of "elke dag" */
export function daysSummary(text: string | null): string | null {
  if (!text) return null;
  const intervals = parseHours(text);
  if (!intervals.length) return null;
  const days = [...new Set(intervals.map((i) => i.day))].sort();
  if (days.length === 7) return "elke dag";
  const names = days.map((d) => DAY_SHORT[d]);
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`
    : names[0];
}

function nowInAmsterdam(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = DAY_MAP[get("weekday").toLowerCase().slice(0, 3)] ?? 0;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type HoursStatus =
  | { kind: "open"; until: string }
  | { kind: "opensToday"; at: string }
  | { kind: "opensTomorrow"; at: string }
  | { kind: "opensOn"; day: string; at: string }
  | null;

export function hoursStatus(text: string | null): HoursStatus {
  if (!text) return null;
  const intervals = parseHours(text);
  if (!intervals.length) return null;
  const now = nowInAmsterdam();

  const today = intervals.filter((i) => i.day === now.day);
  for (const i of today) {
    if (now.minutes >= i.start && now.minutes < i.end) {
      return { kind: "open", until: fmt(i.end) };
    }
  }
  const later = today.filter((i) => i.start > now.minutes).sort((a, b) => a.start - b.start);
  if (later.length) return { kind: "opensToday", at: fmt(later[0].start) };

  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = (now.day + ahead) % 7;
    const slots = intervals.filter((i) => i.day === day).sort((a, b) => a.start - b.start);
    if (slots.length) {
      if (ahead === 1) return { kind: "opensTomorrow", at: fmt(slots[0].start) };
      return { kind: "opensOn", day: DAY_NAMES[day], at: fmt(slots[0].start) };
    }
  }
  return null;
}

/** "Nu open, tot 17:00" / "Opent om 13:00" / "Opent morgen om 09:00" / "Opent vrijdag om 09:00" */
export function hoursStatusText(text: string | null): string | null {
  const status = hoursStatus(text);
  if (!status) return null;
  switch (status.kind) {
    case "open":
      return `Nu open, tot ${status.until}`;
    case "opensToday":
      return `Opent om ${status.at}`;
    case "opensTomorrow":
      return `Opent morgen om ${status.at}`;
    case "opensOn":
      return `Opent ${status.day} om ${status.at}`;
  }
}
