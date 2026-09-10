"use client";

import { useState, useTransition } from "react";
import { AlarmClock, Check, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { CourseVM } from "../_lib/queries";
import {
  createAssignment,
  createExam,
  deleteAssignment,
  deleteExam,
  toggleAssignment,
  updateAssignment,
  updateExam,
} from "../_lib/actions";
import type { AssignmentVM, ExamVM } from "./tasks-view";
import { SectionTitle } from "./section-title";
import { fromDateTimeLocal, toDateTimeLocal, tomorrowEveningLocal } from "../_lib/local-datetime";
import { useTimezone } from "../_lib/ui-store";

const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

function AcademicForm({
  kind,
  courses,
  item,
  onClose,
}: {
  kind: "assignment" | "exam";
  courses: CourseVM[];
  item?: AssignmentVM | ExamVM;
  onClose: () => void;
}) {
  const timezone = useTimezone();
  const assignment = kind === "assignment" ? (item as AssignmentVM | undefined) : undefined;
  const exam = kind === "exam" ? (item as ExamVM | undefined) : undefined;
  const initialDate = assignment?.dueAt ?? exam?.examAt;
  const [title, setTitle] = useState(item?.title ?? "");
  const [courseId, setCourseId] = useState(item?.courseId ?? "");
  const [date, setDate] = useState(
    initialDate ? toDateTimeLocal(initialDate, timezone) : tomorrowEveningLocal(timezone),
  );
  const [detail, setDetail] = useState(assignment?.description ?? exam?.notes ?? "");
  const [location, setLocation] = useState(exam?.location ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const save = () => start(async () => {
    const dateIso = fromDateTimeLocal(date, timezone);
    if (!dateIso) {
      setError("날짜와 시간을 확인하세요.");
      return;
    }
    const result = kind === "assignment"
      ? assignment
        ? await updateAssignment({ id: assignment.id, title, courseId: courseId || null, description: detail || null, dueAt: dateIso })
        : await createAssignment({ title, courseId: courseId || null, description: detail || null, dueAt: dateIso })
      : exam
        ? await updateExam({ id: exam.id, title, courseId: courseId || null, notes: detail || null, location: location || null, examAt: dateIso })
        : await createExam({ title, courseId: courseId || null, notes: detail || null, location: location || null, examAt: dateIso });
    if (result.ok) onClose();
    else setError(result.error);
  });

  return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-4 shadow-[0_2px_6px_rgba(255,127,178,0.14)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-primary">{item ? "수정" : "추가"}</h3>
        <button type="button" onClick={onClose} aria-label="닫기" className="grid size-9 place-items-center rounded-full border-2 border-border text-muted"><X size={15} aria-hidden="true" /></button>
      </div>
      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">제목<input value={title} onChange={(event) => setTitle(event.target.value)} className={`${fieldClass} mt-1`} autoFocus /></label>
        <label className="text-[11.5px] font-extrabold text-muted">과목<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={`${fieldClass} mt-1`}><option value="">없음</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <label className="text-[11.5px] font-extrabold text-muted">{kind === "assignment" ? "마감" : "시험 일시"}<input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className={`${fieldClass} mt-1`} /></label>
        {kind === "exam" && <label className="text-[11.5px] font-extrabold text-muted">장소<input value={location} onChange={(event) => setLocation(event.target.value)} className={`${fieldClass} mt-1`} /></label>}
        <label className="text-[11.5px] font-extrabold text-muted">메모<textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows={2} className={`${fieldClass} mt-1 py-2.5`} /></label>
        {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
        <button type="button" onClick={save} disabled={pending || !title.trim() || !date} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary px-4 font-display text-sm font-semibold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />저장</button>
      </div>
    </div>
  );
}

function AssignmentRow({ item, courses }: { item: AssignmentVM; courses: CourseVM[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (editing) return <AcademicForm kind="assignment" courses={courses} item={item} onClose={() => setEditing(false)} />;
  const remove = () => {
    if (!window.confirm(`“${item.title}” 과제를 삭제할까요?`)) return;
    start(async () => { const result = await deleteAssignment(item.id); if (!result.ok) setError(result.error); });
  };
  const urgent = !item.done && item.daysLeft <= 3;
  return (
    <div className={`rounded-[18px] border-2 bg-surface p-3.5 ${urgent ? "border-now" : "border-border"} ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => start(async () => { const result = await toggleAssignment(item.id); if (!result.ok) setError(result.error); })} className={`grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft ${item.done ? "text-done" : urgent ? "text-now" : "text-primary"}`} aria-label={`${item.title} ${item.done ? "미완료" : "완료"} 처리`}><Check size={18} aria-hidden="true" /></button>
        <div className="min-w-0 flex-1"><p className={`text-[13.5px] font-bold ${item.done ? "text-muted line-through" : ""}`}>{item.title}</p><p className="mt-0.5 text-[11.5px] text-muted">{item.course || "과목 없음"} · {item.date}</p></div>
        <div className="flex shrink-0"><button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-full text-muted" aria-label={`${item.title} 편집`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} className="grid size-9 place-items-center rounded-full text-now" aria-label={`${item.title} 삭제`}><Trash2 size={15} aria-hidden="true" /></button></div>
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-now">{error}</p>}
    </div>
  );
}

function ExamRow({ item, courses }: { item: ExamVM; courses: CourseVM[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (editing) return <AcademicForm kind="exam" courses={courses} item={item} onClose={() => setEditing(false)} />;
  const remove = () => {
    if (!window.confirm(`“${item.title}” 시험을 삭제할까요?`)) return;
    start(async () => { const result = await deleteExam(item.id); if (!result.ok) setError(result.error); });
  };
  return (
    <div className={`rounded-[18px] border-2 border-now bg-surface p-3.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-now"><AlarmClock size={18} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{item.title}</p><p className="mt-0.5 text-[11.5px] text-muted">{item.course || "과목 없음"} · {item.date}{item.location ? ` · ${item.location}` : ""}</p></div>
        <div className="flex shrink-0"><button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-full text-muted" aria-label={`${item.title} 편집`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} className="grid size-9 place-items-center rounded-full text-now" aria-label={`${item.title} 삭제`}><Trash2 size={15} aria-hidden="true" /></button></div>
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-now">{error}</p>}
    </div>
  );
}

export function AcademicItems({ courses, assignments, exams }: { courses: CourseVM[]; assignments: AssignmentVM[]; exams: ExamVM[] }) {
  const [adding, setAdding] = useState<"assignment" | "exam" | null>(null);
  return (
    <>
      <SectionTitle count={`${assignments.length}개`}>과제</SectionTitle>
      <div className="flex flex-col gap-2.5">{assignments.map((item) => <AssignmentRow key={item.id} item={item} courses={courses} />)}{!assignments.length && !adding && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">등록된 과제가 없어요.</p>}{adding === "assignment" ? <AcademicForm kind="assignment" courses={courses} onClose={() => setAdding(null)} /> : <button type="button" onClick={() => setAdding("assignment")} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"><Plus size={15} aria-hidden="true" />과제 추가</button>}</div>

      <SectionTitle count={`${exams.length}개`}>시험</SectionTitle>
      <div className="flex flex-col gap-2.5">{exams.map((item) => <ExamRow key={item.id} item={item} courses={courses} />)}{!exams.length && !adding && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">등록된 시험이 없어요.</p>}{adding === "exam" ? <AcademicForm kind="exam" courses={courses} onClose={() => setAdding(null)} /> : <button type="button" onClick={() => setAdding("exam")} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-now bg-surface text-xs font-bold text-now"><Plus size={15} aria-hidden="true" />시험 추가</button>}</div>
    </>
  );
}
