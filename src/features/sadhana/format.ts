/** Small formatters shared by Sādhanā, Mandala, Player and Profile. */

/** 432 → "7:12" */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 432 → "7 min 12 s" (seconds omitted when zero). */
export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} s`;
  return r === 0 ? `${m} min` : `${m} min ${r} s`;
}

/** "06:00" → "6:00 AM"; null → "Not set" */
export function formatReminder(time: string | null | undefined): string {
  if (!time) return 'Not set';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** 14206 → "14,206" (no Intl dependency). */
export function formatCount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2026-10-26" → "26 October" */
export function formatStartDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[(m || 1) - 1]}`;
}
