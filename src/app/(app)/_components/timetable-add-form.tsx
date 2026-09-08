"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createCourse, createTimetableEvent } from "../_lib/actions";

type Course = { id: string; name: string };
const WEEKDAYS = [
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
];

const field =
  "w-full rounded-[14px] border-2 border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary";

export function TimetableAddForm({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ?? "custom");
  const [newCourse, setNewCourse] = useState("");
  const [title, setTitle] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:15");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const custom = courseId === "custom";
  const resolvedTitle = custom ? title.trim() : (courses.find((c) => c.id === courseId)?.name ?? "");
  const canSubmit = resolvedTitle.length > 0 && !pending;

  const reset = () => {
    setNewCourse("");
    setTitle("");
    setLocation("");
    setError("");
  };

  const submit = () => {
    if (!canSubmit) return;
    start(async () => {
      let cid: string | null = custom ? null : courseId;
      if (custom && newCourse.trim()) {
        const c = await createCourse({ name: newCourse, location: location || null });
        if (!c.ok) {
          setError(c.error);
          return;
        }
        cid = c.id ?? null;
      }
      const res = await createTimetableEvent({
        courseId: cid,
        title: resolvedTitle,
        weekday,
        startTime,
        endTime,
        location: location || null,
      });
      if (res.ok) {
        reset();
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[22px] flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft font-display text-sm font-semibold text-primary"
      >
        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
        수업 추가
      </button>
    );
  }

  return (
    <div className="mt-[22px] rounded-[18px] border-2 border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-primary">수업 추가</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="grid size-11 place-items-center rounded-full border-2 border-border text-muted"
        >
          <X size={14} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">
          과목
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={`${field} mt-1`}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="custom">직접 입력…</option>
          </select>
        </label>

        {custom && (
          <>
            <input
              aria-label="새 과목 이름"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="새 과목 이름 (선택)"
              className={field}
            />
            <input
              aria-label="수업 이름"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="수업 이름"
              className={field}
            />
          </>
        )}

        <label className="text-[11.5px] font-extrabold text-muted">
          요일
          <div className="mt-1 flex gap-1.5">
            {WEEKDAYS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWeekday(w.value)}
                className={`min-h-10 flex-1 rounded-full border-2 font-display text-[13px] font-semibold ${
                  weekday === w.value ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </label>

        <div className="flex gap-2.5">
          <label className="flex-1 text-[11.5px] font-extrabold text-muted">
            시작
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${field} mt-1`} />
          </label>
          <label className="flex-1 text-[11.5px] font-extrabold text-muted">
            종료
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${field} mt-1`} />
          </label>
        </div>

        <input
          aria-label="강의실"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="강의실 (선택)"
          className={field}
        />

        {error && <p role="alert" className="text-[12px] font-bold text-now">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-1 flex min-h-[46px] items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
          추가하기
        </button>
      </div>
    </div>
  );
}
