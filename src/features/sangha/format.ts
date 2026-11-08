/** Indian digit grouping: 1001 → "1,001", 250000 → "2,50,000". */
export function formatRupees(n: number): string {
  const s = String(Math.max(0, Math.floor(n)));
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
}

/* ---- Event dates, always in IST (the Trust's timezone), computed from the ISO date. ---- */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Weekday ("Sun" / "Sunday"), day number, month ("Dec" / "December") and year of an ISO date, in IST. */
export function istDate(iso: string) {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  const wd = d.getUTCDay();
  const m = d.getUTCMonth();
  return {
    weekday: WEEKDAYS[wd],
    weekdayShort: WEEKDAYS[wd].slice(0, 3),
    day: d.getUTCDate(),
    month: MONTHS[m],
    monthLong: MONTHS_LONG[m],
    year: d.getUTCFullYear(),
    monthKey: `${d.getUTCFullYear()}-${String(m + 1).padStart(2, '0')}`,
  };
}

/** "6:30 AM IST" → "6:30 AM". */
export const plainTime = (timeLabel: string) => timeLabel.replace(/\s*IST$/i, '');

/** "Abhyudaya 2026" → "Abhyudaya" (for button labels). */
export const withoutYear = (title: string) => title.replace(/\s+\d{4}$/, '');

/** Who an event is for, in a sentence fragment: "Open to all" → "open to everyone". */
function audience(eligibility: string) {
  if (/^open to all$/i.test(eligibility)) return 'open to everyone';
  if (/^enrolled/i.test(eligibility)) return `for ${eligibility.toLowerCase()}`;
  return eligibility.charAt(0).toLowerCase() + eligibility.slice(1);
}

/** Row meta line: "6:30 AM, online, for enrolled sādhakas" / "4 PM at the ashram, ages 13–24. You’re going". */
export function eventMeta(
  e: { timeLabel: string; place: string; eligibility: string; registered: boolean },
  withGoing = true,
) {
  const online = /^online$/i.test(e.place);
  const where = online ? ', online' : /ashram/i.test(e.place) ? ' at the ashram' : `, ${e.place}`;
  return `${plainTime(e.timeLabel)}${where}, ${audience(e.eligibility)}${withGoing && e.registered ? '. You’re going' : ''}`;
}

/** Next-gathering sentence: "All day at Mahagathe Ashram. Open to everyone; 140 places left." */
export function gatheringLine(e: { timeLabel: string; place: string; eligibility: string; placesLeft: number | null }) {
  const aud = audience(e.eligibility);
  const places =
    e.placesLeft === null ? '' : e.placesLeft === 0 ? '; full' : `; ${e.placesLeft} ${e.placesLeft === 1 ? 'place' : 'places'} left`;
  return `${plainTime(e.timeLabel)} at ${e.place}. ${aud.charAt(0).toUpperCase()}${aud.slice(1)}${places}.`;
}

/** "140 places left" / "Full" / null when unlimited. */
export function placesText(n: number | null) {
  if (n === null) return null;
  if (n === 0) return 'Full';
  return `${n} ${n === 1 ? 'place' : 'places'} left`;
}

/** Program line: "Gen Z guides, for ages 13–24" / "For children". */
export function programLine(p: { tagline: string; ageRange?: string }) {
  return p.ageRange ? `${p.tagline}, for ages ${p.ageRange}` : p.tagline;
}
