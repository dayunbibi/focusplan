"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createTask } from "../_lib/actions";
import { useUi } from "../_lib/ui-store";

type Course = { id: string; name: string };
const PRIORITY_OPTIONS = [
  { label: "높음", value: "HIGH" as const },
  { label: "보통", value: "MEDIUM" as const },
  { label: "낮음", value: "LOW" as const },
];
const DUE_OPTIONS = ["오늘", "내일", "이번 주"] as const;

function Chip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 flex-none whitespace-nowrap rounded-full border-2 px-[15px] font-display text-[12.5px] transition-colors ${
        active ? "border-primary bg-primary font-semibold text-white" : "border-border bg-surface font-medium text-muted"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function AddTaskSheet({ courses }: { courses: Course[] }) {
  const { sheetOpen, closeSheet, showToast } = useUi();
  if (!sheetOpen) return null;
  return <SheetBody courses={courses} onClose={closeSheet} onDone={() => showToast("할 일을 추가했어요")} />;
}

function SheetBody({
  courses,
  onClose,
  onDone,
}: {
  courses: Course[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string | null>(courses[0]?.id ?? null);
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [due, setDue] = useState<(typeof DUE_OPTIONS)[number]>("오늘");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const canAdd = title.trim().length > 0 && !pending;
  const submit = () => {
    if (!canAdd) return;
    start(async () => {
      const res = await createTask({ title, courseId, priority, due });
      if (res.ok) {
        onClose();
        onDone();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <>
      <div
        className="absolute inset-0 bg-[var(--veil)] [animation:kitty-rise_.2s_ease]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="새 할 일"
        className="absolute inset-x-0 bottom-0 rounded-t-[26px] border-2 border-b-0 border-border bg-surface px-[18px] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-14px_34px_rgba(255,127,178,0.24)] [animation:kitty-sheet_.26s_cubic-bezier(.22,1,.36,1)]"
      >
        <span className="mx-auto mb-3.5 block h-[5px] w-11 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold text-primary">새 할 일</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-muted"
          >
            <X size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="new-task-title" className="mb-1.5 mt-4 block text-[11.5px] font-extrabold text-muted">할 일</label>
        <input
          id="new-task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="무엇을 할까요?"
          autoFocus
          className="w-full rounded-full border-2 border-primary bg-surface px-[18px] py-3.5 text-sm font-bold text-foreground shadow-[0_0_0_3px_var(--surface-soft)] outline-none placeholder:text-muted/70"
        />

        <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">과목</p>
        <div className="tabs-scroll flex gap-[7px] overflow-x-auto pb-0.5">
          {courses.map((c) => (
            <Chip key={c.id} active={courseId === c.id} onClick={() => setCourseId(c.id)}>
              {c.name}
            </Chip>
          ))}
          <Chip active={courseId === null} onClick={() => setCourseId(null)}>
            없음
          </Chip>
        </div>

        <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">우선순위</p>
        <div className="flex gap-[7px]">
          {PRIORITY_OPTIONS.map((p) => (
            <Chip
              key={p.value}
              active={priority === p.value}
              onClick={() => setPriority(p.value)}
              className="flex-1 justify-center"
            >
              {p.label}
            </Chip>
          ))}
        </div>

        <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">마감</p>
        <div className="flex gap-[7px]">
          {DUE_OPTIONS.map((d) => (
            <Chip key={d} active={due === d} onClick={() => setDue(d)} className="flex-1 justify-center">
              {d}
            </Chip>
          ))}
        </div>

        {error && <p role="alert" className="mt-3 text-[12px] font-bold text-now">{error}</p>}

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[52px] flex-none rounded-full border-2 border-border bg-surface px-5 font-display text-sm font-semibold text-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canAdd}
            className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary font-display text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(255,127,178,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} strokeWidth={2.4} aria-hidden="true" />
            추가하기
          </button>
        </div>
      </div>
    </>
  );
}
