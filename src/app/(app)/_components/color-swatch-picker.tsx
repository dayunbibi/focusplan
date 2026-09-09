"use client";

import { Check } from "lucide-react";
import { COURSE_INK, COURSE_PALETTE } from "../_lib/course-colors";

export function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5" role="radiogroup" aria-label="색상 선택">
      {COURSE_PALETTE.map((c) => {
        const active = value.toLowerCase() === c.hex.toLowerCase();
        return (
          <button
            key={c.hex}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            onClick={() => onChange(c.hex)}
            style={{ backgroundColor: c.hex, outlineColor: active ? "var(--primary)" : "transparent" }}
            className="grid aspect-square w-full place-items-center rounded-full border-2 border-white/60 outline outline-2 outline-offset-2 transition-transform active:scale-95"
          >
            {active && <Check size={16} strokeWidth={3} color={COURSE_INK} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
