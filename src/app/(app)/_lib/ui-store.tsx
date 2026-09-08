"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

export type FocusSession = {
  id: string;
  course: string;
  title: string;
  durationMin: number;
};

type UiValue = {
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  focus: FocusSession | null;
  openFocus: (session: FocusSession) => void;
  closeFocus: () => void;
  toast: string;
  showToast: (text: string) => void;
};

const UiContext = createContext<UiValue | null>(null);

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within <UiProvider>");
  return ctx;
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focus, setFocus] = useState<FocusSession | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const value: UiValue = {
    sheetOpen,
    openSheet: useCallback(() => setSheetOpen(true), []),
    closeSheet: useCallback(() => setSheetOpen(false), []),
    focus,
    openFocus: useCallback((session: FocusSession) => setFocus(session), []),
    closeFocus: useCallback(() => setFocus(null), []),
    toast,
    showToast,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
