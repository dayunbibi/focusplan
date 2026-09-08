"use client";

import { Play, Plus } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { ProgressHeartCard } from "./progress-heart-card";
import { SectionTitle } from "./section-title";
import { TaskRow } from "./task-row";
import { toneClass } from "../_lib/kitty-tones";
import { useUi } from "../_lib/ui-store";
import type { getDashboard } from "../_lib/queries";

type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

export function TodayView({ name, data }: { name: string; data: Dashboard }) {
  const { openFocus, openSheet } = useUi();
  const { classes, tasks, sessions, upcoming, focus, progress, cheer, tape } = data;

  return (
    <div>
      <ProgressHeartCard
        pct={progress.pct}
        done={progress.done}
        total={progress.total}
        cheer={cheer}
        name={name}
        tape={tape}
      />

      {focus ? (
        <StickerCard rotate={0.9} tone="now" className="mt-[18px]">
          <p className="text-[10.5px] font-extrabold tracking-[0.12em] text-now">지금 가장 중요한 것</p>
          <p className="mt-1.5 font-display text-[17px] font-semibold leading-tight">{focus.title}</p>
          <p className="mb-3 mt-1.5 text-[12.5px] text-now">
            {focus.time} · {focus.durationMin}분 집중 세션
          </p>
          <button
            type="button"
            onClick={() =>
              openFocus({ id: focus.id, course: focus.course, title: focus.title, durationMin: focus.durationMin })
            }
            className="flex min-h-10 items-center gap-1.5 rounded-full border-2 border-now bg-surface px-4 font-display text-[13px] font-semibold text-now"
          >
            <Play size={14} strokeWidth={2} aria-hidden="true" />
            타이머 시작
          </button>
        </StickerCard>
      ) : (
        <StickerCard rotate={0.9} className="mt-[18px]">
          <p className="text-[13px] font-bold text-primary">오늘 공부 세션을 다 끝냈어요 🎉</p>
          <p className="mt-1.5 text-[12.5px] text-muted">공부 계획에서 새 세션을 추가할 수 있어요.</p>
        </StickerCard>
      )}

      <SectionTitle count={`${classes.length}개`}>오늘 수업</SectionTitle>
      {classes.length ? (
        <div className="tabs-scroll -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1.5">
          {classes.map((c, i) => {
            const tone = toneClass[c.state === "done" ? "done" : c.state === "now" ? "now" : "muted"];
            const isNow = c.state === "now";
            return (
              <div
                key={c.id}
                style={{ transform: `rotate(${i % 2 ? 1.2 : -0.9}deg)` }}
                className={`w-[152px] flex-none rounded-[18px] border-2 p-3.5 shadow-[0_2px_6px_rgba(255,127,178,0.14)] ${tone.border} ${isNow ? "bg-surface-soft" : "bg-surface"}`}
              >
                {isNow ? (
                  <span className="rounded-full bg-now px-2 py-0.5 text-[10px] font-extrabold text-white">지금</span>
                ) : (
                  <span className={`inline-block size-2.5 rounded-full ${tone.dot}`} />
                )}
                <p className="mt-2 text-base font-extrabold tabular-nums">{c.startTime}</p>
                <p className="mt-0.5 text-[13px] font-bold">{c.course}</p>
                <p className={`mt-0.5 text-[11.5px] ${isNow ? "text-now" : "text-muted"}`}>{c.location}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">
          오늘은 수업이 없어요.
        </p>
      )}

      <div className="mb-2.5 mt-[22px] flex items-baseline justify-between">
        <p className="font-display text-[15px] font-semibold text-primary">
          오늘 할 일
          <span className="ml-1.5 font-sans text-xs font-bold text-muted tabular-nums">
            {progress.tasksDone}/{tasks.length}
          </span>
        </p>
        <button type="button" onClick={openSheet} className="flex items-center gap-1 text-xs font-extrabold text-muted">
          <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
          추가
        </button>
      </div>
      {tasks.length ? (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} />
          ))}
        </div>
      ) : (
        <p className="rounded-[18px] border-2 border-dashed border-border px-4 py-5 text-center text-[12.5px] text-muted">
          ＋ 버튼으로 첫 할 일을 추가해봐요.
        </p>
      )}

      {sessions.length > 0 && (
        <>
          <SectionTitle>오늘 공부 계획</SectionTitle>
          <div className="flex gap-2.5">
            {sessions.slice(0, 2).map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  openFocus({ id: s.id, course: s.course, title: s.title, durationMin: s.durationMin })
                }
                style={{ transform: `rotate(${i === 0 ? -0.9 : 0.8}deg)` }}
                className={`min-w-0 flex-1 rounded-[18px] border-2 border-border bg-surface-soft p-3.5 text-left ${s.done ? "opacity-60" : ""}`}
              >
                <p className="text-[15px] font-extrabold tabular-nums">{s.time}</p>
                <p className="mt-0.5 text-[12.5px] font-bold">{s.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {s.course} · {s.durationMin}분{s.done ? " · 완료" : ""}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionTitle>다가오는 일정</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {upcoming.map((item) => {
              const urgent = item.daysLeft <= 3;
              return (
                <span
                  key={item.id}
                  className={`flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-[12.5px] font-bold ${
                    urgent ? "border-now bg-surface-soft" : "border-border bg-surface"
                  }`}
                >
                  <strong className={`tabular-nums ${urgent ? "text-now" : "text-primary"}`}>
                    {item.daysLeft <= 0 ? "D-DAY" : `D-${item.daysLeft}`}
                  </strong>
                  {item.title}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
