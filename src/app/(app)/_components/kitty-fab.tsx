"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useUi } from "../_lib/ui-store";

const fabClass =
  "absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 grid size-[60px] place-items-center rounded-full border-2 border-primary bg-primary text-white shadow-[0_8px_20px_rgba(255,127,178,0.45)]";

/** 새 할 일/수업 추가 FAB — 투데이/할 일/시간표 화면에서만 보임. */
export function KittyFab({ nextClassColor }: { nextClassColor: string }) {
  const pathname = usePathname();
  const { openSheet, openClassSheet } = useUi();

  if (pathname === "/timetable") {
    return (
      <button
        type="button"
        onClick={() => openClassSheet({ defaultColor: nextClassColor })}
        aria-label="수업 추가"
        className={fabClass}
      >
        <Plus size={26} strokeWidth={2.4} aria-hidden="true" />
      </button>
    );
  }

  if (pathname !== "/" && pathname !== "/tasks") return null;

  return (
    <button type="button" onClick={openSheet} aria-label="새 할 일 추가" className={fabClass}>
      <Plus size={26} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
