import type { LucideIcon } from "lucide-react";

export function FeaturePlaceholder({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-primary">FocusPlan</p>
      <h1 className="text-3xl font-bold tracking-[-0.04em]">{title}</h1>
      <p className="mt-2 text-muted">{description}</p>
      <section className="mt-8 grid min-h-72 place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Icon size={22} aria-hidden="true" /></span>
          <h2 className="mt-4 font-bold">다음 단계에서 채워질 공간이에요</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">이번 MVP 단계에서는 전체 정보 구조와 이동 경로를 먼저 준비했습니다.</p>
        </div>
      </section>
    </div>
  );
}
