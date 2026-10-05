/** App-wide date/time helpers. Everything is calculated in the user's stored IANA timezone. */

const DEFAULT_TIMEZONE = "America/Toronto";
const LOCALE = "en-CA";

type DateParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function parts(date: Date, timeZone = DEFAULT_TIMEZONE): DateParts {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, item) => {
      if (item.type !== "literal") result[item.type] = item.value;
      return result;
    }, {});
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

/** Converts a wall-clock time in the given timezone to a UTC Date. Corrects twice to handle DST edges. */
export function zonedDate(year: number, month: number, day: number, hour = 0, minute = 0, timeZone = DEFAULT_TIMEZONE) {
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute);
  let result = new Date(wallClockUtc);
  for (let attempt = 0; attempt < 2; attempt++) {
    const actual = parts(result, timeZone);
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    result = new Date(result.getTime() + wallClockUtc - actualAsUtc);
  }
  return result;
}

export function startOfToday(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  return zonedDate(current.year, current.month, current.day, 0, 0, timeZone);
}

export function endOfTodayExclusive(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  const next = new Date(Date.UTC(current.year, current.month - 1, current.day + 1));
  return zonedDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 0, 0, timeZone);
}

export function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 86_400_000);
}

/** Monday 00:00 of the current week */
export function startOfWeek(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  const dayNumber = Date.UTC(current.year, current.month - 1, current.day);
  const jsWeekday = new Date(dayNumber).getUTCDay();
  const iso = jsWeekday === 0 ? 7 : jsWeekday;
  const monday = new Date(dayNumber - (iso - 1) * 86_400_000);
  return zonedDate(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate(), 0, 0, timeZone);
}

/** ISO weekday (1 = Mon ... 7 = Sun) in the user's timezone */
export function isoWeekday(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  const js = new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay();
  return js === 0 ? 7 : js;
}

export function hhmm(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  return `${String(current.hour).padStart(2, "0")}:${String(current.minute).padStart(2, "0")}`;
}

/** Days left (today = 0, tomorrow = 1). Past dates are negative. */
export function dday(date: Date, timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const target = parts(date, timeZone);
  const current = parts(now, timeZone);
  return Math.round(
    (Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(current.year, current.month - 1, current.day)) /
      86_400_000,
  );
}

/** Countdown badge text: "Today", "Tomorrow", "3 days" */
export function daysLeftLabel(daysLeft: number) {
  if (daysLeft <= 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `${daysLeft} days`;
}

/** "Oct 10" */
export function formatMonthDay(date: Date, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone, month: "short", day: "numeric" }).format(date);
}

/** A time like "18:00" when it's due today, otherwise a date like "Oct 10" */
export function formatDue(date: Date | null, timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  if (!date) return "No due date";
  return dateKey(date, timeZone) === dateKey(now, timeZone) ? hhmm(date, timeZone) : formatMonthDay(date, timeZone);
}

/** Minutes → "1h 30m" / "45m" / "2h" */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export type DueChoice = "today" | "tomorrow" | "thisWeek";

/** Due choice from the add-task sheet → dueAt */
export function dueFromChoice(choice: DueChoice, timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  if (choice === "today") return zonedDate(current.year, current.month, current.day, 23, 59, timeZone);
  if (choice === "tomorrow") {
    const next = new Date(Date.UTC(current.year, current.month - 1, current.day + 1));
    return zonedDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 23, 59, timeZone);
  }
  const nextMonday = addDays(startOfWeek(timeZone, now), 7);
  const monday = parts(nextMonday, timeZone);
  return zonedDate(monday.year, monday.month, monday.day, 0, 0, timeZone);
}

/** Masking-tape label on the Today card: "SEP · 8 · TUE" */
export function todayTape(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weekday = new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay();
  return `${months[current.month - 1]} · ${current.day} · ${days[weekday]}`;
}

export function dateKey(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  return `${current.year}-${String(current.month).padStart(2, "0")}-${String(current.day).padStart(2, "0")}`;
}
