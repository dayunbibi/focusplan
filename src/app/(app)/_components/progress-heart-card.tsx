import { Clover } from "lucide-react";
import Image from "next/image";
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
    <StickerCard rotate={0} className="poipi-greeting">
      <p className="poipi-date">{tape}</p>
      <div className="mb-3 flex items-center gap-3">
        <Image src="/poipi/cheering-transparent.webp" width={96} height={96} alt="클로버를 들고 응원하는 포잎이" priority className="poipi-greeting-art" />
        <div>
          <p className="text-[9px] font-bold tracking-[.15em] text-muted">
            A FRESH LITTLE START
          </p>
          <p className="mt-1 text-xs text-primary">
            A little luck for your day 🍀
          </p>
        </div>
      </div>
      <h1 className="font-display text-[23px] font-semibold leading-tight text-primary">
        Hi, {name}!
      </h1>
      <p className="mb-3.5 mt-1.5 text-[13px] text-muted">
        One small plan at a time. Let’s make room for a good day.
      </p>
      <div className="flex items-center gap-3">
        <span className="font-display text-[34px] font-semibold leading-none tabular-nums text-primary">
          {pct}%
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-[3px]">
            {Array.from({ length: Math.max(total, 1) }, (_, i) => (
              <Clover
                key={i}
                size={15}
                aria-hidden="true"
                className={
                  i < done
                    ? "fill-primary text-primary"
                    : "fill-surface-soft text-border"
                }
              />
            ))}
          </div>
          <p className="mt-1 text-[11.5px] tabular-nums text-muted">
            {done} of {total} done · {cheer}
          </p>
        </div>
      </div>
      <div
        className="poipi-progress"
        role="progressbar"
        aria-label="Daily progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </StickerCard>
  );
}
