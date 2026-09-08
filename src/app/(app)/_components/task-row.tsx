"use client";

import { useState, useTransition } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import type { CourseVM, TaskVM } from "../_lib/queries";
import { deleteTask, toggleTask, updateTask } from "../_lib/actions";

const rotate = (i: number) => (i % 3 === 0 ? "-0.7deg" : i % 3 === 1 ? "0.6deg" : "-0.4deg");

const badgeClass = (priority: TaskVM["priority"]) =>
  priority === "높음" ? "text-primary" : priority === "보통" ? "text-now" : "";

const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

function localDateTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function TaskRow({
  task,
  index,
  compact = false,
  editable = false,
  courses = [],
}: {
  task: TaskVM;
  index: number;
  compact?: boolean;
  editable?: boolean;
  courses?: CourseVM[];
}) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [courseId, setCourseId] = useState(task.courseId ?? "");
  const [priority, setPriority] = useState(task.priorityValue);
  const [dueAt, setDueAt] = useState(localDateTime(task.dueAt));
  const [error, setError] = useState("");
  const onToggle = () => start(async () => {
    const result = await toggleTask(task.id);
    if (!result.ok) setError(result.error);
  });

  const save = () => start(async () => {
    const result = await updateTask({
      id: task.id,
      title,
      notes: notes || null,
      courseId: courseId || null,
      priority,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
    });
    if (result.ok) {
      setEditing(false);
      setError("");
    } else setError(result.error);
  });

  const remove = () => {
    if (!window.confirm(`“${task.title}” 할 일을 삭제할까요?`)) return;
    start(async () => {
      const result = await deleteTask(task.id);
      if (!result.ok) setError(result.error);
    });
  };

  if (compact) {
    return (
      <label className="flex min-h-14 cursor-pointer items-center gap-2.5 rounded-[14px] border-2 border-border bg-surface px-3 py-2.5">
        <input type="checkbox" className="kitty" checked={task.done} disabled={pending} onChange={onToggle} />
        <span className={`text-sm font-bold ${task.done ? "text-muted line-through" : "text-foreground"}`}>
          {task.title}
        </span>
      </label>
    );
  }

  if (editing) {
    return (
      <div className="rounded-[18px] border-2 border-primary bg-surface p-3.5 shadow-[0_2px_6px_rgba(255,127,178,0.14)]">
        <div className="flex flex-col gap-2.5">
          <label className="text-[11.5px] font-extrabold text-muted">제목<input value={title} onChange={(event) => setTitle(event.target.value)} className={`${fieldClass} mt-1`} /></label>
          <label className="text-[11.5px] font-extrabold text-muted">메모<input value={notes} onChange={(event) => setNotes(event.target.value)} className={`${fieldClass} mt-1`} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11.5px] font-extrabold text-muted">과목<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={`${fieldClass} mt-1`}><option value="">없음</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
            <label className="text-[11.5px] font-extrabold text-muted">우선순위<select value={priority} onChange={(event) => setPriority(event.target.value as TaskVM["priorityValue"])} className={`${fieldClass} mt-1`}><option value="HIGH">높음</option><option value="MEDIUM">보통</option><option value="LOW">낮음</option></select></label>
          </div>
          <label className="text-[11.5px] font-extrabold text-muted">마감<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className={`${fieldClass} mt-1`} /></label>
          {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="grid size-11 place-items-center rounded-full border-2 border-border text-muted" aria-label="편집 취소"><X size={16} aria-hidden="true" /></button>
            <button type="button" onClick={save} disabled={pending || !title.trim()} className="flex min-h-11 items-center gap-1.5 rounded-full border-2 border-primary bg-primary px-4 text-xs font-bold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />저장</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ transform: `rotate(${rotate(index)})` }}
      className={`flex min-h-14 items-start gap-3 rounded-[18px] border-2 border-border bg-surface p-3.5 shadow-[0_2px_6px_rgba(255,127,178,0.14)] ${pending ? "opacity-60" : ""}`}
    >
      <input
        type="checkbox"
        className="kitty mt-0.5"
        checked={task.done}
        disabled={pending}
        onChange={onToggle}
        aria-label={`${task.title} 완료 표시`}
      />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-bold ${task.done ? "text-muted line-through" : "text-foreground"}`}>
          {task.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
          <span>{`${task.course ? `${task.course} · ` : ""}${task.due}`}</span>
          {task.priority && (
            <span className={`rounded-full bg-surface-soft px-1.5 py-0.5 font-extrabold ${badgeClass(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </span>
      </span>
      {editable && (
        <span className="flex shrink-0 gap-1">
          <button type="button" onClick={(event) => { event.preventDefault(); setEditing(true); }} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-soft" aria-label={`${task.title} 편집`}><Pencil size={15} aria-hidden="true" /></button>
          <button type="button" onClick={(event) => { event.preventDefault(); remove(); }} disabled={pending} className="grid size-9 place-items-center rounded-full text-now hover:bg-surface-soft disabled:opacity-50" aria-label={`${task.title} 삭제`}><Trash2 size={15} aria-hidden="true" /></button>
        </span>
      )}
      {error && !editing && <span role="alert" className="sr-only">{error}</span>}
    </div>
  );
}
