"use client";

import { useState, useTransition } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { deleteClassGroup } from "../_lib/actions";
import { ClassScheduleForm, type ClassGroupInitial } from "./class-schedule-form";
import { COURSE_DANGER, COURSE_INK, COURSE_INK_MUTED } from "../_lib/course-colors";

const WEEKDAY_LABEL = ["월", "화", "수", "목", "금", "토", "일"];

export type ClassGroup = ClassGroupInitial & { key: string };

export function ClassCard({ group, index }: { group: ClassGroup; index: number }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <ClassScheduleForm
        initial={{ courseId: group.courseId, name: group.name, color: group.color, eventIds: group.eventIds, slots: group.slots }}
        defaultColor={group.color}
        onClose={() => setEditing(false)}
      />
    );
  }

  const remove = () => {
    if (!window.confirm(`“${group.name}” 수업을 삭제할까요? 등록된 시간 ${group.slots.length}개가 모두 삭제돼요.`)) return;
    start(async () => {
      const result = await deleteClassGroup({ courseId: group.courseId, eventIds: group.eventIds });
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div
      style={{ transform: `rotate(${index % 2 ? 0.5 : -0.4}deg)`, backgroundColor: group.color, color: COURSE_INK }}
      className={`rounded-[18px] border border-black/10 p-3.5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[14px] font-bold">{group.name}</p>
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{ color: COURSE_INK_MUTED }}
            className="grid size-9 place-items-center rounded-full"
            aria-label={`${group.name} 편집`}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            style={{ color: COURSE_DANGER }}
            className="grid size-9 place-items-center rounded-full disabled:opacity-50"
            aria-label={`${group.name} 삭제`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {group.slots.map((slot) => (
          <p key={slot.key} style={{ color: COURSE_INK_MUTED }} className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <span style={{ color: COURSE_INK }} className="font-bold">
              {WEEKDAY_LABEL[slot.weekday - 1]}
            </span>
            <span className="tabular-nums">
              {slot.startTime}–{slot.endTime}
            </span>
            {slot.location && (
              <span className="flex items-center gap-0.5">
                <MapPin size={11} aria-hidden="true" />
                {slot.location}
              </span>
            )}
          </p>
        ))}
      </div>
      {error && <p role="alert" style={{ color: COURSE_DANGER }} className="mt-2 text-xs font-bold">{error}</p>}
    </div>
  );
}
