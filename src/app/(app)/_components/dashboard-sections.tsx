import { AlarmClock, BookOpen, CalendarClock, Clock3, MapPin } from "lucide-react";
import type { CourseTone } from "@/types/dashboard";
import { studyPlans, todayClasses, todayTasks, upcomingItems } from "../_lib/dashboard-data";
import { DashboardCard } from "./dashboard-card";
import { SectionHeader } from "./section-header";

const toneStyles: Record<CourseTone, { dot: string; surface: string; text: string }> = {
  teal: { dot: "bg-[#2c917e]", surface: "bg-[#e7f4f0]", text: "text-[#176353]" },
  blue: { dot: "bg-[#5684c6]", surface: "bg-[#eaf1fb]", text: "text-[#3d6297]" },
  violet: { dot: "bg-[#8876bf]", surface: "bg-[#f0edfa]", text: "text-[#67549e]" },
  amber: { dot: "bg-[#bd812f]", surface: "bg-[#fbf2e5]", text: "text-[#8b5b1a]" },
  rose: { dot: "bg-[#bd6672]", surface: "bg-[#f9ebed]", text: "text-[#974c58]" },
};

export function TodayClassesCard() {
  return (
    <DashboardCard>
      <SectionHeader title="오늘 수업" href="/timetable" />
      <div className="divide-y divide-border px-5 pb-2 sm:px-6">
        {todayClasses.map((item, index) => (
          <div key={item.id} className="flex gap-3 py-4">
            <div className="flex w-[74px] shrink-0 flex-col items-start">
              <span className="text-sm font-semibold tabular-nums">{item.time.slice(0, 5)}</span>
              <span className="mt-0.5 text-xs text-muted tabular-nums">{item.time.slice(8)}</span>
            </div>
            <div className="relative flex min-w-0 flex-1 gap-3">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${toneStyles[item.tone].dot}`} />
              {index < todayClasses.length - 1 && <span className="absolute left-[4px] top-6 h-9 w-px bg-border" aria-hidden="true" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.course}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={13} aria-hidden="true" />{item.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function TodayTasksCard() {
  return (
    <DashboardCard>
      <SectionHeader title="오늘 할 일" href="/tasks" label="할 일 추가" />
      <div className="px-5 pb-3 sm:px-6">
        {todayTasks.map((task) => (
          <label key={task.id} className="group flex min-h-16 cursor-pointer items-start gap-3 border-b border-border py-3 last:border-0">
            <input
              type="checkbox"
              defaultChecked={task.completed}
              aria-label={`${task.title} 완료 표시`}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
            />
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-semibold group-has-[:checked]:text-muted group-has-[:checked]:line-through ${task.completed ? "text-muted line-through" : ""}`}>{task.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                {task.course && <span>{task.course}</span>}
                <span className="flex items-center gap-1"><Clock3 size={12} aria-hidden="true" />{task.due}</span>
                {task.priority && <span className={task.priority === "높음" ? "font-semibold text-danger" : "font-semibold text-warning"}>{task.priority}</span>}
              </span>
            </span>
          </label>
        ))}
      </div>
    </DashboardCard>
  );
}

export function StudyPlanCard() {
  return (
    <DashboardCard>
      <SectionHeader title="오늘 공부 계획" href="/study-planner" />
      <div className="space-y-3 p-5 pt-4 sm:px-6 sm:pb-6">
        {studyPlans.map((plan) => (
          <div key={plan.id} className={`flex items-center gap-3 rounded-xl p-3.5 ${toneStyles[plan.tone].surface}`}>
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-white/75 ${toneStyles[plan.tone].text}`}>
              <BookOpen size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold ${toneStyles[plan.tone].text}`}>{plan.course}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{plan.topic}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold tabular-nums">{plan.time}</p>
              <p className="text-xs text-muted tabular-nums">{plan.duration}분</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted">
          <span>총 공부 시간</span>
          <strong className="text-sm text-foreground tabular-nums">1시간 30분</strong>
        </div>
      </div>
    </DashboardCard>
  );
}

export function UpcomingCard() {
  return (
    <DashboardCard>
      <SectionHeader title="다가오는 일정" href="/calendar" />
      <div className="divide-y divide-border px-5 pb-3 sm:px-6">
        {upcomingItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-4">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.type === "시험" ? "bg-[#fff0e6] text-[#a84e1d]" : "bg-primary-soft text-primary-strong"}`}>
              {item.type === "시험" ? <AlarmClock size={18} aria-hidden="true" /> : <CalendarClock size={18} aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{item.course} · {item.date}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${item.daysLeft <= 3 ? "bg-[#fbeaea] text-danger" : "bg-surface-soft text-muted"}`}>D-{item.daysLeft}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
