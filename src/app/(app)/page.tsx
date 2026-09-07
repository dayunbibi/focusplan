import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { ProgressCard } from "./_components/progress-card";
import {
  StudyPlanCard,
  TodayClassesCard,
  TodayTasksCard,
  UpcomingCard,
} from "./_components/dashboard-sections";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">9월 7일 월요일</p>
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.04em] sm:text-3xl">좋은 아침이에요, 민준님</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">오늘도 부담 없이, 계획한 만큼만 해봐요.</p>
        </div>
        <Link href="/tasks" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-strong sm:flex">
          <Plus size={18} aria-hidden="true" />
          새 할 일
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="xl:col-span-4">
          <ProgressCard />
        </div>
        <div className="xl:col-span-8">
          <div className="flex min-h-[216px] items-center gap-4 rounded-2xl border border-[#d8e8e4] bg-[#edf7f4] p-5 sm:p-6">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary">
              <Sparkles size={21} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary-strong">오늘의 포커스</p>
              <p className="mt-1 text-lg font-bold tracking-[-0.025em] sm:text-xl">통계 중간고사 준비를 시작해요</p>
              <p className="mt-1.5 text-sm leading-6 text-muted">오후 4시에 50분 집중 세션이 예정되어 있어요.</p>
            </div>
            <Link href="/study-planner" className="hidden min-h-11 shrink-0 items-center rounded-xl border border-[#c8ddd7] bg-white px-4 text-sm font-semibold text-primary-strong transition-colors hover:bg-primary-soft md:flex">계획 보기</Link>
          </div>
        </div>

        <div className="xl:col-span-5"><TodayClassesCard /></div>
        <div className="xl:col-span-7"><TodayTasksCard /></div>
        <div className="xl:col-span-7"><StudyPlanCard /></div>
        <div className="xl:col-span-5"><UpcomingCard /></div>
      </div>
    </div>
  );
}
