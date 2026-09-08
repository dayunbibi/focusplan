import { MapPin } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import type { getTimetable } from "../_lib/queries";
import { SectionTitle } from "./section-title";
import { TimetableAddForm } from "./timetable-add-form";
import { ClassCard, type ClassGroup } from "./class-card";

type TimetableData = Awaited<ReturnType<typeof getTimetable>>;
type Row = TimetableData["rows"][number];
const weekdays = ["월", "화", "수", "목", "금"];
const hours = Array.from({ length: 14 }, (_, index) => index + 8);
const tones = ["border-primary bg-surface-soft text-primary", "border-done bg-surface-soft text-done", "border-now bg-surface-soft text-now"];

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
      groups.set(key, { key, courseId: row.courseId, name: row.title, eventIds: [row.id], slots: [slot] });
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
    <div style={{ transform: `rotate(${index % 2 ? 0.5 : -0.4}deg)` }} className="rounded-[18px] border-2 border-border bg-surface p-3.5">
      <div className="flex items-center gap-3">
        <span className="size-3 shrink-0 rounded-full bg-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold">{event.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11.5px] text-muted">
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
          {hours.map((hour) => (
            <div key={hour} className="grid min-h-[58px] grid-cols-[30px_repeat(5,minmax(48px,1fr))] gap-0.5">
              <span className="pt-1 text-[10.5px] font-bold tabular-nums text-muted">{String(hour).padStart(2, "0")}</span>
              {weekdays.map((day, column) => {
                const events = data.rows.filter((event) => event.weekday === column + 1 && Number(event.startTime.slice(0, 2)) === hour);
                return (
                  <div key={day} className="min-w-0 border-t-2 border-dashed border-border p-0.5">
                    {events.map((event, index) => (
                      <div
                        key={event.id}
                        className={`mb-0.5 rounded-[9px] border px-1 py-1 text-[9.5px] font-extrabold leading-tight ${tones[index % tones.length]}`}
                        title={`${event.title} ${event.startTime}-${event.endTime}`}
                      >
                        <p className="truncate">{event.title}</p>
                        {event.location && <p className="truncate font-semibold opacity-80">{event.location}</p>}
                        <p className="truncate font-semibold tabular-nums opacity-70">{event.startTime}–{event.endTime}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <TimetableAddForm />

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
