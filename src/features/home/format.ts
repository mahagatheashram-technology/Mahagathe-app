const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** An ISO calendar date ("2026-11-06") as a local date, with no timezone shift. */
export function parseCalendarDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** H-05: greeting for the local time of day. */
export function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Event dates are shown in India time wherever the phone is: { month: 'DEC', day: '20' } */
export function eventDateBadge(iso: string) {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  return { month: MONTHS[d.getUTCMonth()].slice(0, 3).toUpperCase(), day: String(d.getUTCDate()).padStart(2, '0') };
}
