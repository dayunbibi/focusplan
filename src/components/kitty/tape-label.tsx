/** 마스킹테이프 라벨 — 점선 테두리 알약. */
export function TapeLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-grid h-[22px] place-items-center whitespace-nowrap rounded-[4px] border-2 border-dashed border-primary bg-surface-soft px-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary ${className}`}
    >
      {children}
    </span>
  );
}
