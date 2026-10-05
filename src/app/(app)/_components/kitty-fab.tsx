"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useUi } from "../_lib/ui-store";

const fabClass =
  "absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 grid size-[60px] place-items-center rounded-full border-2 border-primary bg-primary text-white shadow-[0_8px_20px_rgba(255,127,178,0.45)]";

/** Floating add button for tasks and classes. Shown only on Today, Tasks, and Timetable. */
export function KittyFab({ nextClassColor }: { nextClassColor: string }) {
  const pathname = usePathname();
  const { openSheet, openClassSheet } = useUi();

  if (pathname === "/timetable") {
    return (
      <button
        type="button"
        onClick={() => openClassSheet({ defaultColor: nextClassColor })}
        aria-label="Add class"
        className={fabClass}
      >
        <Plus size={26} strokeWidth={2.4} aria-hidden="true" />
      </button>
    );
  }

  if (pathname !== "/" && pathname !== "/tasks") return null;

  return (
    <button type="button" onClick={openSheet} aria-label="Add task" className={fabClass}>
      <Plus size={26} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
