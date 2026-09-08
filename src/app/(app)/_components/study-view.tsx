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
import { useUi } from "../_lib/ui-store";
import { SectionTitle } from "./section-title";

type StudyData = Awaited<ReturnType<typeof getStudyPlan>>;
type Session = StudyData["sessions"][number];
const fieldClass = "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";
const bars = ["bg-primary", "bg-done", "bg-now"];

function localDateTime(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  if (!iso) date.setHours(date.getHours() + 1, 0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function StudyForm({ data, item, onClose }: { data: StudyData; item?: Session; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [courseId, setCourseId] = useState(item?.courseId ?? "");
  const [plannedAt, setPlannedAt] = useState(localDateTime(item?.plannedAt));
  const [durationMin, setDurationMin] = useState(item?.durationMin ?? 50);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const payload = { title, courseId: courseId || null, plannedAt: new Date(plannedAt).toISOString(), durationMin };
    const result = item ? await updateStudySession({ ...payload, id: item.id }) : await createStudySession(payload);
    if (result.ok) onClose(); else setError(result.error);
  });
  return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-4">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-semibold text-primary">공부 세션 {item ? "수정" : "추가"}</h3><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border-2 border-border text-muted" aria-label="닫기"><X size={15} aria-hidden="true" /></button></div>
      <div className="flex flex-col gap-2.5">
        <label className="text-[11.5px] font-extrabold text-muted">공부 주제<input value={title} onChange={(e) => setTitle(e.target.value)} className={`${fieldClass} mt-1`} autoFocus /></label>
        <label className="text-[11.5px] font-extrabold text-muted">과목<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={`${fieldClass} mt-1`}><option value="">없음</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
        <div className="grid grid-cols-[1fr_92px] gap-2"><label className="text-[11.5px] font-extrabold text-muted">시작<input type="datetime-local" value={plannedAt} onChange={(e) => setPlannedAt(e.target.value)} className={`${fieldClass} mt-1`} /></label><label className="text-[11.5px] font-extrabold text-muted">분<input type="number" min={5} max={480} step={5} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className={`${fieldClass} mt-1`} /></label></div>
        {error && <p role="alert" className="text-xs font-bold text-now">{error}</p>}
        <button type="button" onClick={save} disabled={pending || !title.trim() || !plannedAt} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />저장</button>
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
    if (!window.confirm(`“${session.title}” 세션을 삭제할까요?`)) return;
    start(async () => { const result = await deleteStudySession(session.id); if (!result.ok) setError(result.error); });
  };
  return (
    <div style={{ transform: `rotate(${index % 2 ? 0.5 : -0.5}deg)` }} className={`rounded-[18px] border-2 ${session.done ? "border-done" : "border-border"} bg-surface p-3.5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3"><button type="button" onClick={() => start(async () => { const result = await toggleStudySession(session.id); if (!result.ok) setError(result.error); })} className={`grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft ${session.done ? "text-done" : "text-primary"}`} aria-label={`${session.title} ${session.done ? "미완료" : "완료"} 처리`}>{session.done ? <Check size={18} aria-hidden="true" /> : <BookOpen size={18} aria-hidden="true" />}</button><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary">{session.course || "자유 공부"}{session.ai && <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-soft px-1.5 py-0.5 text-[9.5px] font-extrabold text-now"><Sparkles size={9} aria-hidden="true" />AI</span>}</p><p className={`mt-0.5 text-[13.5px] font-bold ${session.done ? "text-muted line-through" : ""}`}>{session.title}</p><p className="mt-0.5 text-[11px] text-muted">{session.date} · {session.time} · {session.durationMin}분</p></div><div className="flex shrink-0"><button type="button" onClick={() => openFocus({ id: session.id, course: session.course, title: session.title, durationMin: session.durationMin })} disabled={session.done} className="grid size-9 place-items-center rounded-full text-primary disabled:opacity-30" aria-label={`${session.title} 타이머 시작`}><Play size={15} aria-hidden="true" /></button><button type="button" onClick={() => setEditing(true)} className="grid size-9 place-items-center rounded-full text-muted" aria-label={`${session.title} 편집`}><Pencil size={15} aria-hidden="true" /></button><button type="button" onClick={remove} className="grid size-9 place-items-center rounded-full text-now" aria-label={`${session.title} 삭제`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
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
      if (result.ok) showToast(result.created ? `AI가 세션 ${result.created}개를 짜줬어요` : "이번 주엔 급한 마감이 없어요");
      else setGenError(result.error);
    });
  return (
    <div>
      <StickerCard rotate={-1.1} tape="STUDY LOG">
        <h1 className="font-display text-[22px] font-semibold text-primary-strong">공부 계획</h1>
        <p className="mb-3.5 mt-1.5 text-[12.5px] text-muted">오늘 {data.plannedCount}세션 · {data.plannedMinutes}분 · 완료 {data.sessionsDone}/{data.plannedCount}</p>
        <div className="flex gap-2"><div className="flex-1 rounded-[14px] border-2 border-border bg-surface-soft px-3 py-2.5"><p className="text-[11px] font-extrabold text-primary-strong">이번 주</p><p className="mt-0.5 font-display text-[18px] font-semibold tabular-nums">{data.weekTotalHours}</p></div><div className="flex-1 rounded-[14px] border-2 border-done bg-surface-soft px-3 py-2.5"><p className="text-[11px] font-extrabold text-done">완료 세션</p><p className="mt-0.5 font-display text-[18px] font-semibold tabular-nums">{data.sessionsDone}개</p></div></div>
        <button
          type="button"
          onClick={generate}
          disabled={genPending}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-surface font-display text-[13px] font-semibold text-primary disabled:opacity-50"
        >
          <Sparkles size={15} aria-hidden="true" />
          {genPending ? "계획 짜는 중..." : "AI로 이번 주 계획 짜기"}
        </button>
        {genError && <p role="alert" className="mt-2 text-xs font-bold text-now">{genError}</p>}
      </StickerCard>

      <SectionTitle count={`${data.sessions.length}개`}>공부 세션</SectionTitle>
      <div className="flex flex-col gap-2.5">{data.sessions.map((session, index) => <SessionRow key={session.id} session={session} data={data} index={index} />)}{!data.sessions.length && !adding && <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-7 text-center"><Mascot size={60} muted className="mx-auto" /><p className="mt-2 text-[12.5px] text-muted">아직 공부 세션이 없어요.</p></div>}{adding ? <StudyForm data={data} onClose={() => setAdding(false)} /> : <button type="button" onClick={() => setAdding(true)} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"><Plus size={15} aria-hidden="true" />세션 추가</button>}</div>

      <SectionTitle>과목별 이번 주 배분</SectionTitle>
      {data.distribution.length ? <div className="flex flex-col gap-3">{data.distribution.map((row, index) => <div key={row.course}><div className="mb-1.5 flex justify-between text-xs font-bold"><span>{row.course}</span><span className="tabular-nums text-muted">{row.hours}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-soft"><div className={`h-full rounded-full ${bars[index % bars.length]}`} style={{ width: `${row.percent}%` }} /></div></div>)}</div> : <p className="text-[12.5px] text-muted">이번 주 공부 기록이 아직 없어요.</p>}

      <SectionTitle>다가오는 시험</SectionTitle>
      {data.nextExam ? <div className="rounded-[18px] border-2 border-now bg-surface p-3.5"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-soft text-now"><AlarmClock size={18} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{data.nextExam.title}</p><p className="mt-0.5 text-[11.5px] text-muted">{data.nextExam.course || "과목 없음"} · {data.nextExam.date}</p></div><span className="rounded-full bg-now px-2.5 py-1 text-[11.5px] font-extrabold text-white">{data.nextExam.daysLeft <= 0 ? "D-DAY" : `D-${data.nextExam.daysLeft}`}</span></div></div> : <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">다가오는 시험이 없어요.</p>}
    </div>
  );
}
