/**
 * datetime-local <input> 값과 저장용 UTC instant 사이 변환을 사용자의 저장된 IANA
 * 타임존 기준으로 처리한다. 브라우저 로컬 타임존(getTimezoneOffset)에 의존하면 사용자가
 * 자기 시간대 밖(여행·VPN·시계 오설정)에 있을 때 마감·시험 시각이 어긋난다.
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

/** 저장된 UTC instant(ISO) → 사용자 타임존 벽시계 "YYYY-MM-DDTHH:mm" (datetime-local 입력값). */
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

/** datetime-local 입력값("YYYY-MM-DDTHH:mm")을 사용자 타임존 벽시계로 해석해 UTC ISO 문자열로. */
export function fromDateTimeLocal(value: string, timeZone: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  return zonedDate(+match[1], +match[2], +match[3], +match[4], +match[5], timeZone).toISOString();
}

/** 새 항목 기본값: 사용자 타임존 기준 내일 18:00 (datetime-local 입력값). */
export function tomorrowEveningLocal(timeZone: string): string {
  return toDateTimeLocal(new Date(Date.now() + 86_400_000).toISOString(), timeZone).slice(0, 11) + "18:00";
}

/** 새 항목 기본값: 사용자 타임존 기준 다음 정시 (datetime-local 입력값). */
export function nextHourLocal(timeZone: string): string {
  return toDateTimeLocal(new Date(Date.now() + 3_600_000).toISOString(), timeZone).slice(0, 14) + "00";
}
