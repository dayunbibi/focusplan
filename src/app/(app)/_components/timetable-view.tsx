import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import type { getTimetable } from "../_lib/queries";
import { SectionTitle } from "./section-title";
import { TimetableAddForm } from "./timetable-add-form";
import { TimetableEventRow } from "./timetable-event-row";

type TimetableData = Awaited<ReturnType<typeof getTimetable>>;
const weekdays = ["월", "화", "수", "목", "금"];
const hours = Array.from({ length: 14 }, (_, index) => index + 8);
const tones = ["border-primary bg-surface-soft text-primary", "border-done bg-surface-soft text-done", "border-now bg-surface-soft text-now"];

export function TimetableView({ data }: { data: TimetableData }) {
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
                return <div key={day} className="min-w-0 border-t-2 border-dashed border-border p-0.5">{events.map((event, index) => <div key={event.id} className={`mb-0.5 truncate rounded-[9px] border px-1 py-1 text-[9.5px] font-extrabold ${tones[index % tones.length]}`} title={`${event.title} ${event.startTime}-${event.endTime}`}>{event.title}</div>)}</div>;
              })}
            </div>
          ))}
        </div>
      </div>

      <TimetableAddForm courses={data.courses.map(({ id, name }) => ({ id, name }))} />

      <SectionTitle count={`${data.todayRows.length}개`}>오늘 수업</SectionTitle>
      {data.todayRows.length ? (
        <div className="flex flex-col gap-2.5">
          {data.todayRows.map((event, index) => <TimetableEventRow key={event.id} event={event} courses={data.courses} index={index} />)}
        </div>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-7 text-center"><Mascot size={60} muted className="mx-auto" /><p className="mt-2 text-[12.5px] text-muted">오늘 등록된 수업이 없어요.</p></div>
      )}

      <SectionTitle count={`${data.rows.length}개`}>전체 수업</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {data.rows.map((event, index) => <TimetableEventRow key={event.id} event={event} courses={data.courses} index={index} />)}
      </div>
      {!data.rows.length && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">수업 추가 버튼으로 첫 시간표를 만들어보세요.</p>}
    </div>
  );
}
