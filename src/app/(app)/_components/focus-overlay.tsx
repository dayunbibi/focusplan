"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Pause, Play, RotateCcw, X } from "lucide-react";
import type { TaskVM } from "../_lib/queries";
import { completeStudySession } from "../_lib/actions";
import { useUi, type FocusSession } from "../_lib/ui-store";
import { TaskRow } from "./task-row";

const CIRC = 653.45;

export function FocusOverlay({ tasks }: { tasks: TaskVM[] }) {
  const { focus, closeFocus, showToast } = useUi();
  if (!focus) return null;
  return (
    <OverlayBody
      key={focus.id}
      session={focus}
      tasks={tasks.filter((t) => !t.done).slice(0, 2)}
      onClose={closeFocus}
      onDone={() => showToast("세션 완료! 잘했어요")}
    />
  );
}

function OverlayBody({
  session,
  tasks,
  onClose,
  onDone,
}: {
  session: FocusSession;
  tasks: TaskVM[];
  onClose: () => void;
  onDone: () => void;
}) {
  const full = Math.max(session.durationMin, 1) * 60;
  const [secs, setSecs] = useState(full);
  const [running, setRunning] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const ticking = running && secs > 0;

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [ticking]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const offset = (CIRC * (1 - secs / full)).toFixed(2);
  const state = secs === 0 ? "세션 완료" : ticking ? "집중 중" : "대기 중";
  const startLabel = secs === full ? "시작하기" : "이어서";

  const complete = () =>
    start(async () => {
      const result = await completeStudySession(session.id);
      if (result.ok) {
        onClose();
        onDone();
      } else {
        setError(result.error);
      }
    });

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--primary) 20%, transparent), transparent 46%), var(--background)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="집중 타이머"
      className="absolute inset-0 flex flex-col overflow-y-auto px-[22px] pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-[calc(1.375rem+env(safe-area-inset-top))] [animation:kitty-rise_.3s_cubic-bezier(.22,1,.36,1)]"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-muted"
        >
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <span className="rounded-full border-2 border-border bg-surface-soft px-3.5 py-1.5 text-[11.5px] font-extrabold text-primary">
          {session.course || "집중 세션"}
        </span>
        <span className="w-10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-[19px] font-semibold">{session.title}</p>
        <p className="mt-1 text-[12.5px] text-muted">{session.durationMin}분 세션</p>

        <div className="relative mx-auto mt-[22px] grid size-[250px] place-items-center">
          <svg viewBox="0 0 240 240" width="250" height="250" className="-rotate-90" aria-hidden="true">
            <circle cx="120" cy="120" r="104" fill="none" stroke="var(--surface-soft)" strokeWidth="16" />
            <circle
              cx="120"
              cy="120"
              r="104"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute text-center">
            <p className="font-display text-[50px] font-semibold leading-none tabular-nums text-primary">
              {mm}:{ss}
            </p>
            <p className="mt-1.5 text-xs font-extrabold tracking-[0.14em] text-muted">{state}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setSecs(full);
            }}
            aria-label="다시 시작"
            className="grid size-[52px] place-items-center rounded-full border-2 border-border bg-surface text-muted"
          >
            <RotateCcw size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            disabled={secs === 0}
            className="flex min-h-14 min-w-[152px] items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary font-display text-base font-semibold text-white shadow-[0_8px_20px_rgba(255,127,178,0.35)] disabled:opacity-50"
          >
            {ticking ? (
              <>
                <Pause size={18} strokeWidth={2} aria-hidden="true" />
                일시정지
              </>
            ) : (
              <>
                <Play size={18} strokeWidth={2} aria-hidden="true" />
                {startLabel}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={complete}
            disabled={pending}
            aria-label="세션 완료"
            className="grid size-[52px] place-items-center rounded-full border-2 border-done bg-surface-soft text-done disabled:opacity-50"
          >
            <Check size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-xs font-bold text-now">{error}</p>}
      </div>

      <div className="border-t-2 border-dashed border-border pt-3.5">
        <p className="mb-2 font-display text-sm font-semibold text-primary">이 세션에서 할 것</p>
        <div className="flex flex-col gap-2">
          {tasks.length ? (
            tasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} compact />)
          ) : (
            <p className="text-[12.5px] text-muted">남은 할 일이 없어요. 푹 쉬어도 좋아요!</p>
          )}
        </div>
      </div>
    </div>
  );
}
