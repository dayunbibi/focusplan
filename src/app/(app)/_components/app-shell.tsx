import Link from "next/link";
import { Bell } from "lucide-react";
import { Mascot } from "@/components/kitty/mascot";
import { KittyTabs } from "./kitty-tabs";

export function AppShell({
  children,
  overlays,
  userInitial,
}: {
  children: React.ReactNode;
  overlays?: React.ReactNode;
  userInitial: string;
}) {
  return (
    <div className="relative mx-auto flex h-dvh max-w-[440px] flex-col overflow-hidden">
      <a
        href="#main-content"
        className="absolute left-4 top-2 z-50 -translate-y-16 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="flex-none border-b-2 border-dashed border-border bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-[58px] items-center justify-between px-4">
          <span className="flex items-center gap-2.5">
            <Mascot size={30} />
            <span className="font-display text-[17px] font-semibold text-primary">FocusPlan</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Link
              href="/settings"
              aria-label="설정 열기"
              className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-muted"
            >
              <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            <Link
              href="/settings"
              aria-label="설정 열기"
              className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface-soft font-display text-sm font-semibold text-primary"
            >
              {userInitial}
            </Link>
          </div>
        </div>
        <KittyTabs />
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="kitty-paper flex-1 overflow-y-auto rounded-t-[22px] border-t-2 border-border px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5"
      >
        {children}
      </main>

      {overlays}
    </div>
  );
}
