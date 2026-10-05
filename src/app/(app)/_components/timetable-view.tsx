import { MapPin } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import type { getTimetable } from "../_lib/queries";
import { SectionTitle } from "./section-title";
import { ClassBlockButton } from "./class-block-button";
import { ClassCard, type ClassGroup } from "./class-card";
import { COURSE_INK, COURSE_INK_MUTED } from "../_lib/course-colors";

type TimetableData = Awaited<ReturnType<typeof getTimetable>>;
type Row = TimetableData["rows"][number];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = Array.from({ length: 14 }, (_, index) => index + 8);

/** One hour on the time axis = HOUR_HEIGHT px. Mobile and desktop share it so proportions always match. */
const HOUR_HEIGHT = 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
const GRID_START_MIN = hours[0] * 60;
const GRID_END_MIN = GRID_START_MIN + hours.length * 60;

function timeToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Converts startTime-endTime into grid top/height in px, clipping anything outside the grid. */
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
 * Assigns columns so classes that overlap on the same day (real schedules do overlap by a
 * few minutes) sit side by side. Standard calendar overlap algorithm: walk events by start
 * time, reuse columns that have ended, and split the width per overlapping cluster.
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

/** Groups events by courseId, or by name for events that have no course yet. */
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
  const groupByEventId = new Map<string, ClassGroup>();
  for (const group of groups) for (const id of group.eventIds) groupByEventId.set(id, group);

  return (
    <div>
      <StickerCard rotate={-1} tape="MY TIMETABLE">
        <h1 className="font-display text-[22px] font-semibold text-primary-strong">My Timetable</h1>
        <p className="mt-1.5 text-[12.5px] text-muted">{data.courseCount} course{data.courseCount === 1 ? "" : "s"} · {data.eventCount} class{data.eventCount === 1 ? "" : "es"}{data.todayLabel ? ` · Today is ${data.todayLabel}` : ""}</p>
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
                    const group = groupByEventId.get(event.id);
                    if (!group) return null;
                    return (
                      <ClassBlockButton
                        key={event.id}
                        title={event.title}
                        startTime={event.startTime}
                        endTime={event.endTime}
                        location={event.location}
                        lines={lines}
                        group={group}
                        style={{
                          top,
                          height,
                          left: `${col * widthPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: event.color,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionTitle count={data.todayRows.length}>Today’s classes</SectionTitle>
      {data.todayRows.length ? (
        <div className="flex flex-col gap-2.5">
          {data.todayRows.map((event, index) => <TodayClassRow key={event.id} event={event} index={index} />)}
        </div>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-7 text-center"><Mascot size={60} muted className="mx-auto" /><p className="mt-2 text-[12.5px] text-muted">No classes today.</p></div>
      )}

      <SectionTitle count={groups.length}>All classes</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {groups.map((group, index) => <ClassCard key={group.key} group={group} index={index} />)}
      </div>
      {!groups.length && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">Tap ＋ to build your timetable.</p>}
    </div>
  );
}
