import { Heart } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";

export function ProgressHeartCard({
  pct,
  done,
  total,
  cheer,
  name,
  tape,
}: {
  pct: number;
  done: number;
  total: number;
  cheer: string;
  name: string;
  tape: string;
}) {
  return (
    <StickerCard rotate={-1.2} tape={tape}>
      <h1 className="font-display text-[23px] font-semibold leading-tight text-primary">
        좋은 아침이에요, {name}님
      </h1>
      <p className="mb-3.5 mt-1.5 text-[13px] text-muted">오늘도 부담 없이, 계획한 만큼만 해봐요.</p>
      <div className="flex items-center gap-3">
        <span className="font-display text-[34px] font-semibold leading-none tabular-nums text-primary">
          {pct}%
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-[3px]">
            {Array.from({ length: Math.max(total, 1) }, (_, i) => (
              <Heart
                key={i}
                size={15}
                aria-hidden="true"
                className={i < done ? "fill-primary text-primary" : "fill-surface-soft text-surface-soft"}
              />
            ))}
          </div>
          <p className="mt-1 text-[11.5px] tabular-nums text-muted">
            {total}개 중 {done}개 완료 · {cheer}
          </p>
        </div>
      </div>
    </StickerCard>
  );
}
