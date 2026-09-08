"use client";

import { useUi } from "../_lib/ui-store";

export function KittyToast() {
  const { toast } = useUi();
  if (!toast) return null;

  return (
    <div
      role="status"
      className="absolute bottom-[98px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-done bg-surface-soft px-[18px] py-2.5 text-[13px] font-extrabold text-done shadow-kitty [animation:kitty-rise_.24s_ease]"
    >
      {toast}
    </div>
  );
}
