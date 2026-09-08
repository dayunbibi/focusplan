import { TapeLabel } from "./tape-label";

const tones = {
  default: "border-border bg-surface",
  now: "border-now bg-surface-soft",
  done: "border-done bg-surface-soft",
} as const;

/** 스티커처럼 살짝 기울어진 카드. rotate(도 단위)와 tone으로 변형. */
export function StickerCard({
  children,
  tape,
  rotate = -1,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tape?: React.ReactNode;
  rotate?: number;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-card border-2 ${tones[tone]} p-5 shadow-kitty ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {tape != null && (
        <span className="absolute left-1/2 top-[-11px] -translate-x-1/2 -rotate-2">
          <TapeLabel>{tape}</TapeLabel>
        </span>
      )}
      {children}
    </div>
  );
}
