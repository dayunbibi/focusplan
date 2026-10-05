/**
 * Converts between datetime-local <input> values and stored UTC instants using the
 * user's saved IANA timezone. Relying on the browser's local offset would shift due
 * dates and exam times whenever the user is outside their zone (travel, VPN, wrong clock).
 */
import { zonedDate } from "./date-utils";

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Stored UTC instant (ISO) → wall clock "YYYY-MM-DDTHH:mm" in the user's timezone (datetime-local value). */
export function toDateTimeLocal(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts: Record<string, string> = {};
  for (const part of formatter(timeZone).formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Reads a datetime-local value ("YYYY-MM-DDTHH:mm") as wall-clock time in the user's timezone and returns a UTC ISO string. */
export function fromDateTimeLocal(value: string, timeZone: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  return zonedDate(+match[1], +match[2], +match[3], +match[4], +match[5], timeZone).toISOString();
}

/** Default for new items: tomorrow 18:00 in the user's timezone (datetime-local value). */
export function tomorrowEveningLocal(timeZone: string): string {
  return toDateTimeLocal(new Date(Date.now() + 86_400_000).toISOString(), timeZone).slice(0, 11) + "18:00";
}

/** Default for new items: the next full hour in the user's timezone (datetime-local value). */
export function nextHourLocal(timeZone: string): string {
  return toDateTimeLocal(new Date(Date.now() + 3_600_000).toISOString(), timeZone).slice(0, 14) + "00";
}
