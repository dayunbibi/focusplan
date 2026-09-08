"use client";

import { useState } from "react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { Mascot } from "@/components/kitty/mascot";
import { SectionTitle } from "./section-title";
import { TaskRow } from "./task-row";
import type { CourseVM, TaskVM } from "../_lib/queries";
import { AcademicItems } from "./academic-items";

export type AssignmentVM = { id: string; title: string; description: string | null; courseId: string | null; course: string; dueAt: string; date: string; daysLeft: number; done: boolean };
export type ExamVM = { id: string; title: string; notes: string | null; location: string | null; courseId: string | null; course: string; examAt: string; date: string; daysLeft: number };

export function TasksView({
  tasks,
  courses,
  assignments,
  exams,
}: {
  tasks: TaskVM[];
  courses: CourseVM[];
  assignments: AssignmentVM[];
  exams: ExamVM[];
}) {
  const [filter, setFilter] = useState("전체");
  const filters = ["전체", "오늘", ...courses.map((course) => course.name)];

  const done = tasks.filter((t) => t.done).length;
  const left = tasks.length - done;
  const visible =
    filter === "전체"
      ? tasks
      : filter === "오늘"
        ? tasks.filter((task) => task.dueAt && new Date(task.dueAt).toDateString() === new Date().toDateString())
        : tasks.filter((task) => task.course === filter);
  const filterTitle = filter === "전체" ? "전체 할 일" : filter;

  return (
    <div>
      <StickerCard rotate={-1} tape="TO · DO">
        <h1 className="font-display text-[22px] font-semibold text-primary">
          할 일 {done}/{tasks.length}
        </h1>
        <p className="mt-1.5 text-[12.5px] text-muted">남은 건 {left}개예요. 과목별로 걸러볼 수 있어요.</p>
      </StickerCard>

      <div className="tabs-scroll -mx-4 mt-4 flex gap-[7px] overflow-x-auto px-4 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-10 flex-none whitespace-nowrap rounded-full border-2 px-[15px] font-display text-[12.5px] ${
              filter === f
                ? "border-primary bg-primary font-semibold text-white"
                : "border-border bg-surface font-medium text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <SectionTitle>{filterTitle}</SectionTitle>
      {visible.length ? (
        <div className="flex flex-col gap-2.5">
          {visible.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} editable courses={courses} />
          ))}
        </div>
      ) : (
        <div className="mt-2.5 rounded-[22px] border-2 border-dashed border-border px-5 py-9 text-center">
          <Mascot size={70} muted className="mx-auto" />
          <p className="mt-3 font-display text-base font-semibold text-muted">여긴 아직 비어 있어요</p>
          <p className="mt-1.5 text-[12.5px] text-muted">＋ 버튼으로 첫 할 일을 추가해봐요.</p>
        </div>
      )}

      <AcademicItems courses={courses} assignments={assignments} exams={exams} />
    </div>
  );
}
