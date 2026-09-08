/** 앱 전역 날짜/시간 헬퍼. 저장된 사용자 IANA 타임존을 기준으로 계산한다. */

const DEFAULT_TIMEZONE = "Asia/Seoul";

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

/** 특정 타임존의 벽시계 시각을 UTC Date로 변환한다. DST 경계도 두 번 보정한다. */
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

/** 이번 주 월요일 00:00 */
export function startOfWeek(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  const dayNumber = Date.UTC(current.year, current.month - 1, current.day);
  const jsWeekday = new Date(dayNumber).getUTCDay();
  const iso = jsWeekday === 0 ? 7 : jsWeekday;
  const monday = new Date(dayNumber - (iso - 1) * 86_400_000);
  return zonedDate(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate(), 0, 0, timeZone);
}

/** ISO 요일(1=월…7=일), 사용자 타임존 기준 */
export function isoWeekday(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  const js = new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay();
  return js === 0 ? 7 : js;
}

export function hhmm(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  return `${String(current.hour).padStart(2, "0")}:${String(current.minute).padStart(2, "0")}`;
}

/** 남은 일수 (오늘=0, 내일=1). 지난 날짜는 음수. */
export function dday(date: Date, timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const target = parts(date, timeZone);
  const current = parts(now, timeZone);
  return Math.round(
    (Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(current.year, current.month - 1, current.day)) /
      86_400_000,
  );
}

/** "9월 10일" */
export function formatMonthDay(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  return `${current.month}월 ${current.day}일`;
}

/** 오늘이면 "오전 11:00" / "오후 6:00", 아니면 "9월 10일" */
export function formatDue(date: Date | null, timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  if (!date) return "기한 없음";
  const target = parts(date, timeZone);
  const current = parts(now, timeZone);
  const sameDay = target.year === current.year && target.month === current.month && target.day === current.day;
  if (!sameDay) return formatMonthDay(date, timeZone);
  const period = target.hour < 12 ? "오전" : "오후";
  const h12 = target.hour % 12 === 0 ? 12 : target.hour % 12;
  return target.minute === 0
    ? `${period} ${h12}:00`
    : `${period} ${h12}:${String(target.minute).padStart(2, "0")}`;
}

/** 분 → "1시간 30분" / "45분" / "2시간" */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

/** 바텀시트 마감 선택지 → dueAt */
export function dueFromChoice(choice: "오늘" | "내일" | "이번 주", timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  if (choice === "오늘") return zonedDate(current.year, current.month, current.day, 23, 59, timeZone);
  if (choice === "내일") {
    const next = new Date(Date.UTC(current.year, current.month - 1, current.day + 1));
    return zonedDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 23, 59, timeZone);
  }
  const nextMonday = addDays(startOfWeek(timeZone, now), 7);
  const monday = parts(nextMonday, timeZone);
  return zonedDate(monday.year, monday.month, monday.day, 0, 0, timeZone);
}

/** 투데이 카드 마스킹테이프 라벨: "9 · 8 · TUE" */
export function todayTape(timeZone = DEFAULT_TIMEZONE, now = new Date()) {
  const current = parts(now, timeZone);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weekday = new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay();
  return `${current.month} · ${current.day} · ${days[weekday]}`;
}

export function dateKey(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const current = parts(date, timeZone);
  return `${current.year}-${String(current.month).padStart(2, "0")}-${String(current.day).padStart(2, "0")}`;
}
