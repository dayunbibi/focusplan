"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ClassGroupInitial } from "../_components/class-schedule-form";

export type FocusSession = {
  id: string;
  course: string;
  title: string;
  durationMin: number;
};

export type ClassSheetState = { initial?: ClassGroupInitial; defaultColor: string } | null;

type UiValue = {
  timezone: string;
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  classSheet: ClassSheetState;
  openClassSheet: (state: { initial?: ClassGroupInitial; defaultColor: string }) => void;
  closeClassSheet: () => void;
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

/** 로그인한 사용자의 저장된 IANA 타임존. 모든 날짜 입력·표시 변환의 기준. */
export function useTimezone() {
  return useUi().timezone;
}

export function UiProvider({ children, timezone }: { children: React.ReactNode; timezone: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [classSheet, setClassSheet] = useState<ClassSheetState>(null);
  const [focus, setFocus] = useState<FocusSession | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const value: UiValue = {
    timezone,
    sheetOpen,
    openSheet: useCallback(() => setSheetOpen(true), []),
    closeSheet: useCallback(() => setSheetOpen(false), []),
    classSheet,
    openClassSheet: useCallback((state: { initial?: ClassGroupInitial; defaultColor: string }) => setClassSheet(state), []),
    closeClassSheet: useCallback(() => setClassSheet(null), []),
    focus,
    openFocus: useCallback((session: FocusSession) => setFocus(session), []),
    closeFocus: useCallback(() => setFocus(null), []),
    toast,
    showToast,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
