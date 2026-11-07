/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dayKey,
  isMinor,
  canStorePersonalData,
  canApprove,
  canAccessPractice,
  normaliseForSearch,
  validateDonation,
  mandalaRule,
  mandalaProgress,
} from "../lib/logic";

void test("T-06: IST day changes at 18:30 UTC, independent of caller timezone", () => {
  assert.equal(
    dayKey(Date.parse("2026-11-06T18:29:59.999Z"), "Asia/Kolkata"),
    "2026-11-06",
  );
  assert.equal(
    dayKey(Date.parse("2026-11-06T18:30:00.000Z"), "Asia/Kolkata"),
    "2026-11-07",
  );
  assert.equal(dayKey(Date.parse("2026-12-31T18:30:00.000Z")), "2027-01-01");
});
void test("T-02: both minor bands and unknown ages gate personal data", () => {
  for (const age of ["under13", "13-17"] as const) {
    assert.equal(isMinor(age), true);
    assert.equal(canStorePersonalData(age, false), false);
    assert.equal(canStorePersonalData(age, true), true);
  }
  assert.equal(canStorePersonalData(undefined, true), false);
  assert.equal(canStorePersonalData("18-24", false), true);
});
void test("T-09/A-03: approval requires a different, identified author", () => {
  assert.equal(canApprove("author", "author"), false);
  assert.equal(canApprove(undefined, "reviewer"), false);
  assert.equal(canApprove("author", "reviewer"), true);
});
void test("S-04: only free resources bypass enrollment", () => {
  assert.equal(canAccessPractice("free", false), true);
  assert.equal(canAccessPractice("enrolled", false), false);
  assert.equal(canAccessPractice("enrolled", true), true);
});
void test("W-14: IAST search ignores accents and letter case", () => {
  assert.equal(
    normaliseForSearch("  Śāntanu  and   Gaṅgā "),
    "santanu and ganga",
  );
  assert.equal(
    normaliseForSearch("Sādhanā Ādi Ṛṣi"),
    normaliseForSearch("Sadhana Adi Rsi"),
  );
  assert.equal(normaliseForSearch("आदि"), "आदि");
});
void test("T-11/G-08: reject foreign currency, invalid precision, overflow and nonpositive donations", () => {
  assert.equal(validateDonation(101, "INR"), 10100);
  assert.equal(validateDonation(0.29, "INR"), 29);
  for (const amount of [0, -1, NaN, Infinity, 0.001, 1e-10, 1_000_001])
    assert.throws(() => validateDonation(amount, "INR"));
  for (const currency of ["USD", "EUR", "inr", ""])
    assert.throws(() => validateDonation(101, currency), /FCRA/);
});
void test("v12/D-23: one sitting per IST date, no expiry, and forty counted sittings", () => {
  assert.equal(mandalaRule("2020-01-01", "2026-11-07", []).decision, "insert");
  assert.equal(
    mandalaRule("2026-11-07", "2026-11-06", []).decision,
    "beforeStart",
  );
  assert.equal(
    mandalaRule("2020-01-01", "2026-11-07", [], true).decision,
    "dailyLimit",
  );
  const duplicate = mandalaRule("2020-01-01", "2026-11-07", [
    "2026-11-07",
    "2026-11-07",
  ]);
  assert.equal(duplicate.sittingsDone, 1);
  assert.equal(duplicate.decision, "existing");
  const days = Array.from({ length: 40 }, (_, i) =>
    new Date(Date.parse("2026-09-01") + i * 86400000)
      .toISOString()
      .slice(0, 10),
  );
  assert.equal(
    mandalaRule("2020-01-01", "2026-11-07", days.slice(0, 39)).decision,
    "insert",
  );
  assert.equal(
    mandalaRule("2020-01-01", "2026-11-07", days).decision,
    "complete",
  );
  assert.equal(mandalaRule("2020-01-01", days[39], days).decision, "existing");
  assert.equal(
    mandalaRule("2020-01-01", "2026-11-07", [...days, "2026-11-07"])
      .sittingsDone,
    40,
  );
});
void test("v12: progress counts sittings beyond the first forty calendar dates", () => {
  const progress = mandalaProgress("2020-01-01", "2026-11-07", [
    "2026-10-01",
    "2026-11-07",
    "2026-11-07",
  ]);
  assert.equal(progress.sittingsDone, 2);
  assert.equal(progress.daysSat, 2);
  assert.equal(progress.todayComplete, true);
});
void test("S-10: 40-day grid and streak handle missed days and duplicate inputs", () => {
  const result = mandalaProgress("2026-11-01", "2026-11-04", [
    "2026-11-01",
    "2026-11-03",
    "2026-11-03",
  ]);
  assert.equal(result.days.length, 40);
  assert.deepEqual(result.days.slice(0, 5), [
    "sat",
    "missed",
    "sat",
    "today",
    "future",
  ]);
  assert.equal(result.daysSat, 2);
  assert.equal(result.streak, 1);
  assert.equal(result.currentDay, 4);
  assert.equal(result.todayComplete, false);
});
