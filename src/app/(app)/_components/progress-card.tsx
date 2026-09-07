import { CheckCircle2, Flame } from "lucide-react";

export function ProgressCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#173e38] p-5 text-white sm:p-6">
      <div className="absolute -right-12 -top-14 size-44 rounded-full border-[28px] border-white/[0.04]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white/75">
            <Flame size={17} aria-hidden="true" />
            오늘의 진행률
          </div>
          <p className="mt-3 text-3xl font-bold tracking-[-0.04em] tabular-nums">67%</p>
          <p className="mt-1 text-sm text-white/70">좋은 흐름이에요. 조금만 더 해봐요!</p>
        </div>
        <div className="relative grid size-20 shrink-0 place-items-center" aria-label="오늘 계획의 67퍼센트 완료">
          <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden="true">
            <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="7" />
            <circle cx="40" cy="40" r="33" fill="none" stroke="#70d6c0" strokeWidth="7" strokeLinecap="round" strokeDasharray="207.35" strokeDashoffset="68.43" />
          </svg>
          <span className="absolute text-sm font-bold tabular-nums">4 / 6</span>
        </div>
      </div>
      <div className="relative mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        {[{ value: "1/3", label: "수업" }, { value: "1/2", label: "할 일" }, { value: "2/2", label: "공부" }].map((item) => (
          <div key={item.label}>
            <p className="flex items-center gap-1 text-sm font-bold tabular-nums"><CheckCircle2 size={14} aria-hidden="true" />{item.value}</p>
            <p className="mt-0.5 text-xs text-white/60">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
