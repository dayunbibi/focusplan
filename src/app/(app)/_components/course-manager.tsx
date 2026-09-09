"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { CourseVM } from "../_lib/queries";
import { createCourse, deleteCourse, updateCourse } from "../_lib/actions";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { COURSE_PALETTE } from "../_lib/course-colors";

const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

function CourseForm({ item, onClose }: { item?: CourseVM; onClose: () => void }) {
  const [name, setName] = useState(item?.name ?? "");
  const [code, setCode] = useState(item?.code ?? "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [color, setColor] = useState(item?.color ?? COURSE_PALETTE[0].hex);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const result = item
      ? await updateCourse({ id: item.id, name, code: code || null, location: location || null, color })
      : await createCourse({ name, code: code || null, location: location || null, color });
    if (result.ok) onClose(); else setError(result.error);
  });
  return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-4">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-semibold text-primary">과목 {item ? "수정" : "추가"}</h3><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border-2 border-border text-muted" aria-label="닫기"><X size={15} aria-hidden="true" /></button></div>
      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">과목명<input value={name} onChange={(e) => setName(e.target.value)} className={`${fieldClass} mt-1`} autoFocus /></label>
        <div className="grid grid-cols-2 gap-2"><label className="text-[11.5px] font-extrabold text-muted">과목 코드<input value={code} onChange={(e) => setCode(e.target.value)} className={`${fieldClass} mt-1`} /></label><label className="text-[11.5px] font-extrabold text-muted">기본 강의실<input value={location} onChange={(e) => setLocation(e.target.value)} className={`${fieldClass} mt-1`} /></label></div>
        <p className="text-[11.5px] font-extrabold text-muted">과목 색상</p>
        <ColorSwatchPicker value={color} onChange={setColor} />
        {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
        <button type="button" onClick={save} disabled={pending || !name.trim()} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary text-sm font-bold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />저장</button>
      </div>
    </div>
  );
}

function CourseRow({ item }: { item: CourseVM }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  if (editing) return <CourseForm item={item} onClose={() => setEditing(false)} />;
  const remove = () => {
    if (!window.confirm(`“${item.name}” 과목을 삭제할까요? 연결된 일정은 과목 없음으로 유지됩니다.`)) return;
    start(async () => { const result = await deleteCourse(item.id); if (!result.ok) setError(result.error); });
  };
  return (
    <div className={`rounded-[18px] border-2 border-border bg-surface p-3.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3"><span className="size-4 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: item.color }} /><div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{item.name}</p><p className="mt-0.5 text-[11.5px] text-muted">{[item.code, item.location].filter(Boolean).join(" · ") || "추가 정보 없음"}</p></div><div className="flex"><button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-full text-muted" aria-label={`${item.name} 편집`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} className="grid size-9 place-items-center rounded-full text-now" aria-label={`${item.name} 삭제`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-now">{error}</p>}
    </div>
  );
}

export function CourseManager({ courses }: { courses: CourseVM[] }) {
  const [adding, setAdding] = useState(false);
  return <div className="flex flex-col gap-2.5">{courses.map((course) => <CourseRow key={course.id} item={course} />)}{!courses.length && !adding && <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">등록된 과목이 없어요.</p>}{adding ? <CourseForm onClose={() => setAdding(false)} /> : <button type="button" onClick={() => setAdding(true)} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"><Plus size={15} aria-hidden="true" />과목 추가</button>}</div>;
}
