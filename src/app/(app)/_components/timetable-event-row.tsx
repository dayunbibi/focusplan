"use client";

import { useState, useTransition } from "react";
import { MapPin, Pencil, Save, Trash2, X } from "lucide-react";
import type { CourseVM, getTimetable } from "../_lib/queries";
import { deleteTimetableEvent, updateTimetableEvent } from "../_lib/actions";

type TimetableEvent = Awaited<ReturnType<typeof getTimetable>>["rows"][number];
const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

export function TimetableEventRow({ event, courses, index }: { event: TimetableEvent; courses: CourseVM[]; index: number }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.rawTitle);
  const [courseId, setCourseId] = useState(event.courseId ?? "");
  const [weekday, setWeekday] = useState(event.weekday);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [location, setLocation] = useState(event.location);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const save = () => start(async () => {
    const result = await updateTimetableEvent({ id: event.id, title, courseId: courseId || null, weekday, startTime, endTime, location: location || null });
    if (result.ok) { setEditing(false); setError(""); } else setError(result.error);
  });
  const remove = () => {
    if (!window.confirm(`“${event.title}” 수업을 삭제할까요?`)) return;
    start(async () => { const result = await deleteTimetableEvent(event.id); if (!result.ok) setError(result.error); });
  };

  if (editing) return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-3.5">
      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">표시 이름<input value={title} onChange={(e) => setTitle(e.target.value)} className={`${fieldClass} mt-1`} /></label>
        <label className="text-[11.5px] font-extrabold text-muted">과목<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={`${fieldClass} mt-1`}><option value="">연결 안 함</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <div className="grid grid-cols-3 gap-2"><label className="text-[11.5px] font-extrabold text-muted">요일<select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={`${fieldClass} mt-1`}>{weekdays.map((day, i) => <option key={day} value={i + 1}>{day}</option>)}</select></label><label className="text-[11.5px] font-extrabold text-muted">시작<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${fieldClass} mt-1 px-1`} /></label><label className="text-[11.5px] font-extrabold text-muted">종료<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${fieldClass} mt-1 px-1`} /></label></div>
        <label className="text-[11.5px] font-extrabold text-muted">장소<input value={location} onChange={(e) => setLocation(e.target.value)} className={`${fieldClass} mt-1`} /></label>
        {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="grid size-11 place-items-center rounded-full border-2 border-border text-muted" aria-label="편집 취소"><X size={16} aria-hidden="true" /></button><button type="button" onClick={save} disabled={pending || !title.trim()} className="flex min-h-11 items-center gap-1.5 rounded-full border-2 border-primary bg-primary px-4 text-xs font-bold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />저장</button></div>
      </div>
    </div>
  );

  return (
    <div style={{ transform: `rotate(${index % 2 ? 0.5 : -0.4}deg)` }} className={`rounded-[18px] border-2 border-border bg-surface p-3.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3"><span className="size-3 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{event.title}</p><p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11.5px] text-muted"><span>{weekdays[event.weekday - 1]} · {event.startTime}–{event.endTime}</span>{event.location && <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" />{event.location}</span>}</p></div><div className="flex shrink-0"><button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-full text-muted" aria-label={`${event.title} 편집`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} disabled={pending} className="grid size-9 place-items-center rounded-full text-now disabled:opacity-50" aria-label={`${event.title} 삭제`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-now">{error}</p>}
    </div>
  );
}
