"use client";

import { X } from "lucide-react";
import { ClassScheduleForm } from "./class-schedule-form";
import { useUi } from "../_lib/ui-store";

/** 수업 추가/수정 바텀시트 — 시간표 페이지의 FAB 및 블록 클릭에서 연다. */
export function ClassSheet() {
  const { classSheet, closeClassSheet } = useUi();
  if (!classSheet) return null;
  const { initial, defaultColor } = classSheet;

  return (
    <>
      <div
        className="absolute inset-0 bg-[var(--veil)] [animation:kitty-rise_.2s_ease]"
        onClick={closeClassSheet}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "수업 수정" : "수업 추가"}
        className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[26px] border-2 border-b-0 border-border bg-surface px-[18px] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-14px_34px_rgba(255,127,178,0.24)] [animation:kitty-sheet_.26s_cubic-bezier(.22,1,.36,1)]"
      >
        <span className="mx-auto mb-3.5 block h-[5px] w-11 rounded-full bg-border" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold text-primary">{initial ? "수업 수정" : "수업 추가"}</h2>
          <button
            type="button"
            onClick={closeClassSheet}
            aria-label="닫기"
            className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-muted"
          >
            <X size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">
          <ClassScheduleForm bare initial={initial} defaultColor={defaultColor} onClose={closeClassSheet} />
        </div>
      </div>
    </>
  );
}
