import Link from "next/link";
import { Bell, Check, Heart, Settings } from "lucide-react";
import { PlannerTabs } from "./nav-links";

const bindingRings = Array.from({ length: 7 }, (_, index) => index);

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-30 border-b border-[#efcfd8]/80 bg-[#fff5f7]/95 pt-[max(.25rem,env(safe-area-inset-top))] backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:pt-0 lg:backdrop-blur-none">
        <div className="mx-auto flex h-15 w-full max-w-[1440px] items-center justify-between px-4 sm:h-17 sm:px-7 lg:px-10">
          <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-xl px-1">
            <span className="relative grid size-9 place-items-center rounded-[12px] border border-[#e8b7c4] bg-[#f7d7e0] text-[#8f465b] shadow-[0_3px_0_#e9bdc8]">
              <Check size={18} strokeWidth={2.5} aria-hidden="true" />
              <Heart className="absolute -right-1 -top-1 fill-[#f4aebe] text-[#f4aebe]" size={10} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[17px] font-bold leading-4 tracking-[-0.035em] text-[#573d45]">FocusPlan</span>
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.19em] text-[#a37d88] sm:block">my study journal</span>
            </span>
          </Link>

          <p className="hidden rounded-full border border-[#edd2d9] bg-white/55 px-4 py-2 text-xs font-medium text-[#8a6972] lg:block">
            Monday, September 7
          </p>

          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" aria-label="알림 보기" className="grid size-11 cursor-pointer place-items-center rounded-full text-[#8f6c76] transition-colors hover:bg-white hover:text-[#6f4451]">
              <Bell size={19} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <Link
              href="/settings"
              aria-label="설정 열기"
              className="grid size-11 place-items-center rounded-full text-[#8f6c76] transition-colors hover:bg-white hover:text-[#6f4451]"
            >
              <Settings size={19} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            <Link href="/settings" className="ml-0.5 hidden min-h-11 items-center gap-2 rounded-full border border-[#efd0d8] bg-white/65 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-[#eee7f8] text-xs font-bold text-[#6c5d8b]">민</span>
              <span className="text-xs font-semibold text-[#715761]">민준</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-8">
          <PlannerTabs />
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 z-20 hidden justify-around lg:flex" aria-hidden="true">
          {bindingRings.map((ring) => (
            <span key={ring} className="-mt-3 block h-9 w-3 rounded-full border-2 border-[#cdaeb5] bg-[#fff7f7] shadow-sm" />
          ))}
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="planner-paper relative mx-auto min-h-[calc(100dvh-9rem)] w-full overflow-hidden rounded-b-[26px] rounded-t-[14px] border border-[#e9c8d1] px-4 pb-8 pt-7 shadow-[0_18px_45px_rgba(132,72,88,0.11),0_3px_10px_rgba(132,72,88,0.05)] sm:px-7 sm:pb-10 sm:pt-9 lg:min-h-[calc(100dvh-11rem)] lg:rounded-[30px] lg:px-10 lg:pb-12 lg:pt-11 xl:px-12"
        >
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
