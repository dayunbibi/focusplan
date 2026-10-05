import assert from "node:assert/strict";
import test from "node:test";
import {
  dateKey,
  daysLeftLabel,
  formatDue,
  formatDuration,
  formatMonthDay,
  isoWeekday,
  startOfToday,
  todayTape,
  zonedDate,
} from "../src/app/(app)/_lib/date-utils";
import { fromDateTimeLocal, toDateTimeLocal } from "../src/app/(app)/_lib/local-datetime";

test("zonedDate resolves wall-clock time using the given IANA zone, not the host offset", () => {
  // Seoul has no DST: 09:00 KST on 2026-06-01 is 00:00Z.
  assert.equal(zonedDate(2026, 6, 1, 9, 0, "Asia/Seoul").toISOString(), "2026-06-01T00:00:00.000Z");
  // Toronto in January is EST (UTC-5): 12:00 local is 17:00Z.
  assert.equal(zonedDate(2026, 1, 15, 12, 0, "America/Toronto").toISOString(), "2026-01-15T17:00:00.000Z");
  // Toronto in July is EDT (UTC-4): 12:00 local is 16:00Z.
  assert.equal(zonedDate(2026, 7, 15, 12, 0, "America/Toronto").toISOString(), "2026-07-15T16:00:00.000Z");
});

test("zonedDate survives the DST fall-back hour (01:30 exists twice in Toronto on 2026-11-01)", () => {
  const d = zonedDate(2026, 11, 1, 1, 30, "America/Toronto");
  assert.ok(!Number.isNaN(d.getTime()));
  // Whichever of the two 01:30s it picks, formatting it back in Toronto must read 01:30.
  assert.equal(toDateTimeLocal(d.toISOString(), "America/Toronto"), "2026-11-01T01:30");
});

test("zonedDate produces a valid instant inside the DST spring-forward gap (02:30 is skipped)", () => {
  const d = zonedDate(2026, 3, 8, 2, 30, "America/Toronto");
  assert.ok(!Number.isNaN(d.getTime()));
  // The nominal instant is 2026-03-08T07:30Z; the 2-pass correction stays within an hour of it.
  assert.ok(Math.abs(d.getTime() - Date.parse("2026-03-08T07:30:00Z")) <= 3_600_000);
});

test("datetime-local <-> UTC round-trips through the user's stored zone", () => {
  for (const [value, zone, expectedIso] of [
    ["2026-06-01T14:30", "Asia/Seoul", "2026-06-01T05:30:00.000Z"],
    ["2026-01-01T23:00", "America/Toronto", "2026-01-02T04:00:00.000Z"],
    ["2026-07-01T09:15", "America/Toronto", "2026-07-01T13:15:00.000Z"],
  ] as const) {
    const iso = fromDateTimeLocal(value, zone);
    assert.equal(iso, expectedIso);
    assert.equal(toDateTimeLocal(iso, zone), value);
  }
});

test("fromDateTimeLocal rejects malformed input instead of guessing", () => {
  assert.equal(fromDateTimeLocal("", "Asia/Seoul"), null);
  assert.equal(fromDateTimeLocal("2026-06-01", "Asia/Seoul"), null);
});

test("startOfToday / dateKey cross the month boundary in the user's zone", () => {
  // 2026-02-28 20:00Z is already 2026-03-01 05:00 in Seoul.
  const now = new Date("2026-02-28T20:00:00Z");
  const start = startOfToday("Asia/Seoul", now);
  assert.equal(start.toISOString(), "2026-02-28T15:00:00.000Z"); // 2026-03-01 00:00 KST
  assert.equal(dateKey(start, "Asia/Seoul"), "2026-03-01");
  assert.equal(isoWeekday(now, "Asia/Seoul"), 7); // Sunday
});

test("display formatters use en-CA wording", () => {
  const now = new Date("2026-10-05T14:00:00Z"); // 10:00 in Toronto
  const laterToday = new Date("2026-10-05T22:00:00Z"); // 18:00 in Toronto
  const nextWeek = new Date("2026-10-12T14:00:00Z");
  assert.equal(formatDue(laterToday, "America/Toronto", now), "18:00");
  assert.equal(formatDue(nextWeek, "America/Toronto", now), "Oct 12");
  assert.equal(formatDue(null, "America/Toronto", now), "No due date");
  assert.equal(formatMonthDay(nextWeek, "America/Toronto"), "Oct 12");
  assert.equal(formatDuration(90), "1h 30m");
  assert.equal(formatDuration(45), "45m");
  assert.equal(formatDuration(120), "2h");
  assert.equal(daysLeftLabel(0), "Today");
  assert.equal(daysLeftLabel(1), "Tomorrow");
  assert.equal(daysLeftLabel(5), "5 days");
  assert.equal(todayTape("America/Toronto", now), "OCT · 5 · MON");
});
