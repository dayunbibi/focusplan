"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ClassScheduleForm } from "./class-schedule-form";

export function TimetableAddForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-[22px] flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft font-display text-sm font-semibold text-primary"
      >
        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
        수업 추가
      </button>
    );
  }

  return (
    <div className="mt-[22px]">
      <ClassScheduleForm onClose={() => setOpen(false)} />
    </div>
  );
}
