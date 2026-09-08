/** "fpt" 섹션 헤딩 — 제목 + 선택적 카운트. */
export function SectionTitle({
  children,
  count,
  className = "",
}: {
  children: React.ReactNode;
  count?: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mb-2.5 mt-[22px] font-display text-[15px] font-semibold text-primary ${className}`}>
      {children}
      {count != null && <span className="ml-1.5 font-sans text-xs font-bold text-muted">{count}</span>}
    </p>
  );
}
