"use client";

import { useState, useTransition } from "react";
import { AlarmClock, BookOpen, Check, Pencil, Play, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import type { getStudyPlan } from "../_lib/queries";
import {
  createStudySession,
  deleteStudySession,
  generateAiStudyPlan,
  toggleStudySession,
  updateStudySession,
} from "../_lib/actions";
import { useTimezone, useUi } from "../_lib/ui-store";
import { daysLeftLabel } from "../_lib/date-utils";
import { fromDateTimeLocal, nextHourLocal, toDateTimeLocal } from "../_lib/local-datetime";
import { SectionTitle } from "./section-title";

type StudyData = Awaited<ReturnType<typeof getStudyPlan>>;
type Session = StudyData["sessions"][number];
const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";
const bars = ["bg-primary", "bg-done", "bg-now"];

function StudyForm({ data, item, onClose }: { data: StudyData; item?: Session; onClose: () => void }) {
  const timezone = useTimezone();
  const [title, setTitle] = useState(item?.title ?? "");
  const [courseId, setCourseId] = useState(item?.courseId ?? "");
  const [plannedAt, setPlannedAt] = useState(
    item ? toDateTimeLocal(item.plannedAt, timezone) : nextHourLocal(timezone),
  );
  const [durationMin, setDurationMin] = useState(item?.durationMin ?? 50);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const plannedIso = fromDateTimeLocal(plannedAt, timezone);
    if (!plannedIso) {
      setError("Please check the start time.");
      return;
    }
    const payload = { title, courseId: courseId || null, plannedAt: plannedIso, durationMin };
    const result = item ? await updateStudySession({ ...payload, id: item.id }) : await createStudySession(payload);
    if (result.ok) onClose(); else setError(result.error);
  });
  return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-4">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-semibold text-primary">{item ? "Edit study session" : "Add study session"}</h3><button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border-2 border-border text-muted" aria-label="Close"><X size={15} aria-hidden="true" /></button></div>
      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">Topic<input value={title} onChange={(e) => setTitle(e.target.value)} className={`${fieldClass} mt-1`} autoFocus /></label>
        <label className="text-[11.5px] font-extrabold text-muted">Course<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={`${fieldClass} mt-1`}><option value="">None</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <div className="grid grid-cols-[1fr_92px] gap-2"><label className="text-[11.5px] font-extrabold text-muted">Start<input type="datetime-local" value={plannedAt} onChange={(e) => setPlannedAt(e.target.value)} className={`${fieldClass} mt-1`} /></label><label className="text-[11.5px] font-extrabold text-muted">Minutes<input type="number" min={5} max={480} step={5} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className={`${fieldClass} mt-1`} /></label></div>
        {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
        <button type="button" onClick={save} disabled={pending || !title.trim() || !plannedAt} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />Save</button>
      </div>
    </div>
  );
}

function SessionRow({ session, data, index }: { session: Session; data: StudyData; index: number }) {
  const { openFocus } = useUi();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (editing) return <StudyForm data={data} item={session} onClose={() => setEditing(false)} />;
  const remove = () => {
    if (!window.confirm(`Delete the session “${session.title}”?`)) return;
    start(async () => { const result = await deleteStudySession(session.id); if (!result.ok) setError(result.error); });
  };
  return (
    <div style={{ transform: `rotate(${index % 2 ? 0.5 : -0.5}deg)` }} className={`rounded-[18px] border-2 ${session.done ? "border-done" : "border-border"} bg-surface p-3.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3"><button type="button" onClick={() => start(async () => { const result = await toggleStudySession(session.id); if (!result.ok) setError(result.error); })} className={`grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft ${session.done ? "text-done" : "text-primary"}`} aria-label={`Mark ${session.title} as ${session.done ? "not done" : "done"}`}>{session.done ? <Check size={18} aria-hidden="true" /> : <BookOpen size={18} aria-hidden="true" />}</button><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary">{session.course || "General study"}{session.ai && <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-soft px-1.5 py-0.5 text-[9.5px] font-extrabold text-now"><Sparkles size={9} aria-hidden="true" />Auto</span>}</p><p className={`mt-0.5 text-[13.5px] font-bold ${session.done ? "text-muted line-through" : ""}`}>{session.title}</p><p className="mt-0.5 text-[11px] text-muted">{session.date} · {session.time} · {session.durationMin} min</p></div><div className="flex shrink-0"><button type="button" onClick={() => openFocus({ id: session.id, course: session.course, title: session.title, durationMin: session.durationMin })} disabled={session.done} className="grid size-11 place-items-center rounded-full text-primary disabled:opacity-30" aria-label={`Start timer for ${session.title}`}><Play size={15} aria-hidden="true" /></button><button type="button" onClick={() => setEditing(true)} className="grid size-11 place-items-center rounded-full text-muted" aria-label={`Edit ${session.title}`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} className="grid size-11 place-items-center rounded-full text-now" aria-label={`Delete ${session.title}`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
      {error && <p role="alert" className="mt-2 text-xs font-bold text-now">{error}</p>}
    </div>
  );
}

export function StudyView({ data }: { data: StudyData }) {
  const [adding, setAdding] = useState(false);
  const [genPending, startGen] = useTransition();
  const [genError, setGenError] = useState("");
  const { showToast } = useUi();
  const generate = () =>
    startGen(async () => {
      const result = await generateAiStudyPlan();
      if (result.ok) showToast(result.created ? `Planned ${result.created} study session${result.created === 1 ? "" : "s"}` : "No upcoming deadlines this week");
      else setGenError(result.error);
    });
  return (
    <div>
      <StickerCard rotate={-1.1} tape="STUDY LOG">
        <h1 className="font-display text-[22px] font-semibold text-primary-strong">Study Planner</h1>
        <p className="mb-3.5 mt-1.5 text-[12.5px] text-muted">Today: {data.plannedCount} session{data.plannedCount === 1 ? "" : "s"} · {data.plannedMinutes} min · {data.sessionsDone}/{data.plannedCount} done</p>
        <div className="flex gap-2"><div className="flex-1 rounded-[14px] border-2 border-border bg-surface-soft px-3 py-2.5"><p className="text-[11px] font-extrabold text-primary-strong">This week</p><p className="mt-0.5 font-display text-[18px] font-semibold tabular-nums">{data.weekTotalHours}</p></div><div className="flex-1 rounded-[14px] border-2 border-done bg-surface-soft px-3 py-2.5"><p className="text-[11px] font-extrabold text-done">Sessions done</p><p className="mt-0.5 font-display text-[18px] font-semibold tabular-nums">{data.sessionsDone}</p></div></div>
        <button
          type="button"
          onClick={generate}
          disabled={genPending}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-surface font-display text-[13px] font-semibold text-primary disabled:opacity-50"
        >
          <Sparkles size={15} aria-hidden="true" />
          {genPending ? "Planning..." : "Auto-plan this week"}
        </button>
        {genError && <p role="alert" className="mt-2 text-xs font-bold text-now">{genError}</p>}
      </StickerCard>

      <SectionTitle count={data.sessions.length}>Study sessions</SectionTitle>
      <div className="flex flex-col gap-2.5">{data.sessions.map((session, index) => <SessionRow key={session.id} session={session} data={data} index={index} />)}{!data.sessions.length && !adding && <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-7 text-center"><Mascot size={60} muted className="mx-auto" /><p className="mt-2 text-[12.5px] text-muted">No study sessions yet.</p></div>}{adding ? <StudyForm data={data} onClose={() => setAdding(false)} /> : <button type="button" onClick={() => setAdding(true)} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"><Plus size={15} aria-hidden="true" />Add session</button>}</div>

      <SectionTitle>This week by course</SectionTitle>
      {data.distribution.length ? <div className="flex flex-col gap-3">{data.distribution.map((row, index) => <div key={row.course}><div className="mb-1.5 flex justify-between text-xs font-bold"><span>{row.course}</span><span className="tabular-nums text-muted">{row.hours}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-soft"><div className={`h-full rounded-full ${bars[index % bars.length]}`} style={{ width: `${row.percent}%` }} /></div></div>)}</div> : <p className="text-[12.5px] text-muted">No study time logged this week.</p>}

      <SectionTitle>Next exam</SectionTitle>
      {data.nextExam ? <div className="rounded-[18px] border-2 border-now bg-surface p-3.5"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-now"><AlarmClock size={18} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{data.nextExam.title}</p><p className="mt-0.5 text-[11.5px] text-muted">{data.nextExam.course || "No course"} · {data.nextExam.date}</p></div><span className="rounded-full bg-now px-2.5 py-1 text-[11.5px] font-extrabold text-white">{daysLeftLabel(data.nextExam.daysLeft)}</span></div></div> : <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">No upcoming exams.</p>}
    </div>
  );
}
