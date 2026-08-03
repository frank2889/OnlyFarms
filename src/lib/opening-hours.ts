// Openingstijden-teksten uit de gids (mix van notaties: "Th 13:00-17:00",
// "Ma-Vr 09:00-17:00", "Dagelijks 08:00-20:00") omzetten naar wat je nu
// wilt weten: nu open, opent om, of opent morgen/op dag X.

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

const TIME = "(\\d{1,2})[:.](\\d{2})";

function toMinutes(h: string, m: string): number {
  return Number(h) * 60 + Number(m);
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseHours(text: string): Interval[] {
  const intervals: Interval[] = [];
  const lower = text.toLowerCase();

  for (const segment of lower.split(/[;,]/)) {
    const seg = segment.trim();
    if (!seg) continue;

    // "dagelijks 08:00-20:00" / "daily ..." / "elke dag ..."
    let m = seg.match(new RegExp(`(?:dagelijks|daily|elke dag|iedere dag|24/7)\\s*${TIME}\\s*[-–]\\s*${TIME}`));
    if (m) {
      for (let d = 0; d < 7; d++)
        intervals.push({ day: d, start: toMinutes(m[1], m[2]), end: toMinutes(m[3], m[4]) });
      continue;
    }
    if (/(dagelijks|daily|24\/7)\s*(geopend|open)?$/.test(seg)) {
      for (let d = 0; d < 7; d++) intervals.push({ day: d, start: 0, end: 24 * 60 });
      continue;
    }

    // "ma-vr 09:00-17:00" (ook Engelse afkortingen)
    m = seg.match(new RegExp(`([a-z]{2,3})\\s*[-–]\\s*([a-z]{2,3})\\s+${TIME}\\s*[-–]\\s*${TIME}`));
    if (m && DAY_MAP[m[1]] !== undefined && DAY_MAP[m[2]] !== undefined) {
      const from = DAY_MAP[m[1]];
      const to = DAY_MAP[m[2]];
      for (let d = from; ; d = (d + 1) % 7) {
        intervals.push({ day: d, start: toMinutes(m[3], m[4]), end: toMinutes(m[5], m[6]) });
        if (d === to) break;
      }
      continue;
    }

    // "th 13:00-17:00" of "za 8.30-12.30"
    m = seg.match(new RegExp(`\\b([a-z]{2,3})\\b\\s+${TIME}\\s*[-–]\\s*${TIME}`));
    if (m && DAY_MAP[m[1]] !== undefined) {
      intervals.push({ day: DAY_MAP[m[1]], start: toMinutes(m[2], m[3]), end: toMinutes(m[4], m[5]) });
      continue;
    }
  }
  return intervals;
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

/** "Nu open, tot 17:00" / "Opent om 13:00" / "Opent morgen om 09:00" / "Opent vrijdag om 09:00" */
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
