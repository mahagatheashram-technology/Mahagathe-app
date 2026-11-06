import { ConvexError } from "convex/values";
import type { AgeBand, MandalaDayState } from "../../src/data/types";

/** D-23 provisional rules: server IST days; missed days do not reset the cycle. */
export const MANDALA_TIMEZONE = "Asia/Kolkata";
export const MANDALA_RULES_VERSION = "provisional-ist-v1";
export const MANDALA_LENGTH = 40;

export function dayKey(timestamp: number, tz = MANDALA_TIMEZONE): string {
  // The production rule uses one fixed UTC+05:30 zone. This path also avoids
  // depending on host ICU data for the server's authoritative Mandala day.
  if (tz === MANDALA_TIMEZONE) {
    return new Date(timestamp + 330 * 60_000).toISOString().slice(0, 10);
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isMinor(band: AgeBand | undefined | null): boolean {
  return band === "under13" || band === "13-17";
}

export function canStorePersonalData(
  band: AgeBand | undefined | null,
  granted: boolean,
): boolean {
  return band != null && (!isMinor(band) || granted);
}

export function canApprove(
  authorId: string | undefined,
  reviewerId: string,
): boolean {
  return authorId !== undefined && authorId !== reviewerId;
}

export function canAccessPractice(
  access: "free" | "enrolled",
  enrolled: boolean,
): boolean {
  return access === "free" || enrolled;
}

export function normaliseForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** The API accepts rupees; storage and provider interfaces use integer paise. */
export function validateDonation(amount: number, currency: string): number {
  if (currency !== "INR") {
    throw new ConvexError(
      "Foreign-currency donations are unavailable until FCRA registration is confirmed. Use INR.",
    );
  }
  const paise = Math.round(amount * 100);
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(paise) ||
    paise <= 0 ||
    paise > 100_000_000 ||
    Math.abs(paise / 100 - amount) > 1e-8
  ) {
    throw new ConvexError(
      "Amount must be positive, at most INR 1,000,000, with at most two decimal places.",
    );
  }
  return paise;
}

export function dayOffset(start: string, day: string): number {
  return Math.floor(
    (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      86_400_000,
  );
}

export function completionDecision(
  start: string,
  day: string,
  exists: boolean,
): "existing" | "insert" {
  // Check retry first so the last-day completion remains idempotent after closing a cycle.
  if (exists) return "existing";
  const offset = dayOffset(start, day);
  if (offset < 0 || offset >= MANDALA_LENGTH)
    throw new ConvexError("This Mandala is outside its 40-day cycle.");
  return "insert";
}

export function mandalaProgress(
  start: string,
  today: string,
  completions: readonly string[],
) {
  const completed = new Set(completions);
  const offset = dayOffset(start, today);
  const days: MandalaDayState[] = Array.from(
    { length: MANDALA_LENGTH },
    (_, i) => {
      const day = new Date(Date.parse(`${start}T00:00:00Z`) + i * 86_400_000)
        .toISOString()
        .slice(0, 10);
      if (completed.has(day)) return "sat";
      return i < offset ? "missed" : i === offset ? "today" : "future";
    },
  );
  let streak = 0;
  let i = Math.min(offset, MANDALA_LENGTH - 1);
  if (days[i] === "today") i -= 1;
  for (; i >= 0 && days[i] === "sat"; i -= 1) streak += 1;
  return {
    currentDay: Math.min(MANDALA_LENGTH, Math.max(1, offset + 1)),
    days,
    daysSat: days.filter((d) => d === "sat").length,
    streak,
    todayComplete: completed.has(today),
  };
}

export function boundedText(value: string, label: string, max = 2000): string {
  const text = value.trim();
  if (!text || text.length > max)
    throw new ConvexError(`${label} must contain 1–${max} characters.`);
  return text;
}

/** Reject impossible dates as well as malformed strings. */
export function isDayKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value
  );
}
