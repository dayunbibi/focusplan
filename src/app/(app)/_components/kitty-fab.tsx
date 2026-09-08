"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useUi } from "../_lib/ui-store";

/** 새 할 일 추가 FAB — 투데이/할 일 화면에서만 보임. */
export function KittyFab() {
  const pathname = usePathname();
  const { openSheet } = useUi();
  if (pathname !== "/" && pathname !== "/tasks") return null;

  return (
    <button
      type="button"
      onClick={openSheet}
      aria-label="새 할 일 추가"
      className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 grid size-[60px] place-items-center rounded-full border-2 border-primary bg-primary text-white shadow-[0_8px_20px_rgba(255,127,178,0.45)]"
    >
      <Plus size={26} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}
