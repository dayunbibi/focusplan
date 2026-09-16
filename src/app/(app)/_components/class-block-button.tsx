"use client";

import { useUi } from "../_lib/ui-store";
import { COURSE_INK } from "../_lib/course-colors";
import type { ClassGroup } from "./class-card";

/** 시간표 그리드의 색상 블록 — 클릭하면 이 수업의 수정/삭제 바텀시트가 열린다. */
export function ClassBlockButton({
  title,
  startTime,
  endTime,
  location,
  lines,
  style,
  group,
}: {
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  lines: number;
  style: React.CSSProperties;
  group: ClassGroup;
}) {
  const { openClassSheet } = useUi();

  return (
    <button
      type="button"
      style={{ ...style, color: COURSE_INK }}
      onClick={() =>
        openClassSheet({
          initial: { courseId: group.courseId, name: group.name, color: group.color, eventIds: group.eventIds, slots: group.slots },
          defaultColor: group.color,
        })
      }
      aria-label={`${title} 수정 ${startTime}-${endTime}`}
      title={`${title} ${startTime}-${endTime}`}
      className="absolute overflow-hidden rounded-[9px] border border-black/10 px-1 py-0.5 text-left text-[9.5px] font-extrabold leading-tight"
    >
      <p className="truncate">{title}</p>
      {lines >= 3 && location && <p className="truncate font-semibold opacity-75">{location}</p>}
      {lines >= 2 && (
        <p className="truncate font-semibold tabular-nums opacity-60">
          {startTime}–{endTime}
        </p>
      )}
    </button>
  );
}
