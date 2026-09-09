import { MapPin } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import type { getTimetable } from "../_lib/queries";
import { SectionTitle } from "./section-title";
import { TimetableAddForm } from "./timetable-add-form";
import { ClassCard, type ClassGroup } from "./class-card";
import { COURSE_INK, COURSE_INK_MUTED, paletteColorAt } from "../_lib/course-colors";

type TimetableData = Awaited<ReturnType<typeof getTimetable>>;
type Row = TimetableData["rows"][number];
const weekdays = ["월", "화", "수", "목", "금"];
const hours = Array.from({ length: 14 }, (_, index) => index + 8);

/** 시간축 1시간 = HOUR_HEIGHT px. 모바일/데스크톱 모두 같은 값을 써서 비율이 항상 동일하다. */
const HOUR_HEIGHT = 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
const GRID_START_MIN = hours[0] * 60;
const GRID_END_MIN = GRID_START_MIN + hours.length * 60;

function timeToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** startTime~endTime을 그리드 기준 top/height(px)로 변환. 그리드 범위 밖은 잘라낸다. */
function blockGeometry(startTime: string, endTime: string) {
  const start = Math.min(Math.max(timeToMinutes(startTime), GRID_START_MIN), GRID_END_MIN);
  const end = Math.min(Math.max(timeToMinutes(endTime), GRID_START_MIN), GRID_END_MIN);
  return {
    top: (start - GRID_START_MIN) * PIXELS_PER_MINUTE,
    height: Math.max((end - start) * PIXELS_PER_MINUTE, 0),
  };
}

type LaidOutEvent = { event: Row; col: number; totalCols: number };

/**
 * 같은 요일 안에서 시간이 겹치는 수업들(실제로 몇 분씩 겹치는 실데이터가 있다)을
 * 나란히 배치하기 위해 컬럼을 배정한다. 표준 캘린더 겹침-컬럼 알고리즘: 시작 시간
 * 순으로 훑으며 끝난 컬럼에 재사용하고, 겹치는 클러스터 단위로 폭을 나눈다.
 */
function layoutDayColumn(events: Row[]): LaidOutEvent[] {
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime) || timeToMinutes(a.endTime) - timeToMinutes(b.endTime),
  );
  const clusters: Row[][] = [];
  let current: Row[] = [];
  let clusterEnd = -Infinity;
  for (const event of sorted) {
    if (current.length && timeToMinutes(event.startTime) >= clusterEnd) {
      clusters.push(current);
      current = [];
      clusterEnd = -Infinity;
    }
    current.push(event);
    clusterEnd = Math.max(clusterEnd, timeToMinutes(event.endTime));
  }
  if (current.length) clusters.push(current);

  const result: LaidOutEvent[] = [];
  for (const cluster of clusters) {
    const columnEnds: number[] = [];
    const colByEvent = new Map<Row, number>();
    for (const event of cluster) {
      const start = timeToMinutes(event.startTime);
      let col = columnEnds.findIndex((end) => end <= start);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(0);
      }
      columnEnds[col] = timeToMinutes(event.endTime);
      colByEvent.set(event, col);
    }
    for (const event of cluster) result.push({ event, col: colByEvent.get(event)!, totalCols: columnEnds.length });
  }
  return result;
}

/** 과목이 연결된 일정은 courseId로, 아직 과목 없이 이름만 있는 일정은 이름으로 묶는다. */
function groupClasses(rows: Row[]): ClassGroup[] {
  const groups = new Map<string, ClassGroup>();
  for (const row of rows) {
    const key = row.courseId ?? `title:${row.title}`;
    const slot = { key: row.id, weekday: row.weekday, startTime: row.startTime, endTime: row.endTime, location: row.location };
    const existing = groups.get(key);
    if (existing) {
      existing.slots.push(slot);
      existing.eventIds.push(row.id);
    } else {
      groups.set(key, { key, courseId: row.courseId, name: row.title, color: row.color, eventIds: [row.id], slots: [slot] });
    }
  }
  return [...groups.values()]
    .map((g) => ({ ...g, slots: g.slots.slice().sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)) }))
    .sort((a, b) => {
      const rank = (g: ClassGroup) => g.slots[0].weekday * 10_000 + Number(g.slots[0].startTime.replace(":", ""));
      return rank(a) - rank(b);
    });
}

function TodayClassRow({ event, index }: { event: Row; index: number }) {
  return (
    <div
      style={{ transform: `rotate(${index % 2 ? 0.5 : -0.4}deg)`, backgroundColor: event.color, color: COURSE_INK }}
      className="rounded-[18px] border border-black/10 p-3.5"
    >
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold">{event.title}</p>
        <p style={{ color: COURSE_INK_MUTED }} className="mt-0.5 flex flex-wrap items-center gap-1 text-[11.5px]">
          <span className="tabular-nums">
            {event.startTime}–{event.endTime}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} aria-hidden="true" />
              {event.location}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export function TimetableView({ data }: { data: TimetableData }) {
  const groups = groupClasses(data.rows);

  return (
    <div>
      <StickerCard rotate={-1} tape="MY TIMETABLE">
        <h1 className="font-display text-[22px] font-semibold text-primary-strong">내 시간표</h1>
        <p className="mt-1.5 text-[12.5px] text-muted">과목 {data.courseCount}개 · 수업 {data.eventCount}개{data.todayLabel ? ` · 오늘은 ${data.todayLabel}요일` : ""}</p>
      </StickerCard>

      <div className="mt-[18px] overflow-hidden rounded-[18px] border-2 border-border bg-surface p-2 shadow-[0_2px_6px_rgba(255,127,178,0.14)]">
        <div className="mb-1 grid grid-cols-[30px_repeat(5,minmax(48px,1fr))] gap-0.5">
          <span />
          {weekdays.map((day, index) => <span key={day} className={`rounded-full py-1 text-center font-display text-xs font-semibold ${data.todayWeekday === index + 1 ? "bg-primary text-white" : "text-muted"}`}>{day}</span>)}
        </div>
        <div className="max-h-[430px] overflow-y-auto">
          <div className="grid grid-cols-[30px_repeat(5,minmax(48px,1fr))] gap-0.5">
            <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
              {hours.map((hour, i) => (
                <span
                  key={hour}
                  style={{ top: i * HOUR_HEIGHT }}
                  className="absolute inset-x-0 -translate-y-1/2 text-[10.5px] font-bold tabular-nums text-muted"
                >
                  {String(hour).padStart(2, "0")}
                </span>
              ))}
            </div>
            {weekdays.map((day, column) => {
              const laidOut = layoutDayColumn(data.rows.filter((event) => event.weekday === column + 1));
              return (
                <div key={day} className="relative min-w-0" style={{ height: hours.length * HOUR_HEIGHT }}>
                  {hours.map((hour, i) => (
                    <div
                      key={hour}
                      style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      className="absolute inset-x-0 border-t-2 border-dashed border-border"
                    />
                  ))}
                  {laidOut.map(({ event, col, totalCols }) => {
                    const { top, height } = blockGeometry(event.startTime, event.endTime);
                    const widthPct = 100 / totalCols;
                    const lines = height >= 38 ? 3 : height >= 24 ? 2 : 1;
                    return (
                      <div
                        key={event.id}
                        style={{
                          top,
                          height,
                          left: `${col * widthPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: event.color,
                          color: COURSE_INK,
                        }}
                        className="absolute overflow-hidden rounded-[9px] border border-black/10 px-1 py-0.5 text-[9.5px] font-extrabold leading-tight"
                        title={`${event.title} ${event.startTime}-${event.endTime}`}
                      >
                        <p className="truncate">{event.title}</p>
                        {lines >= 3 && event.location && <p className="truncate font-semibold opacity-75">{event.location}</p>}
                        {lines >= 2 && (
                          <p className="truncate font-semibold tabular-nums opacity-60">
                            {event.startTime}–{event.endTime}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TimetableAddForm nextColor={paletteColorAt(data.courseCount)} />

      <SectionTitle count={`${data.todayRows.length}개`}>오늘 수업</SectionTitle>
      {data.todayRows.length ? (
        <div className="flex flex-col gap-2.5">
          {data.todayRows.map((event, index) => <TodayClassRow key={event.id} event={event} index={index} />)}
        </div>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-7 text-center"><Mascot size={60} muted className="mx-auto" /><p className="mt-2 text-[12.5px] text-muted">오늘 등록된 수업이 없어요.</p></div>
      )}

      <SectionTitle count={`${groups.length}개`}>전체 수업</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {groups.map((group, index) => <ClassCard key={group.key} group={group} index={index} />)}
      </div>
      {!groups.length && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">수업 추가 버튼으로 첫 시간표를 만들어보세요.</p>}
    </div>
  );
}
