/** 하트 체크박스 + 라벨. 체크 시 라벨은 --muted + 취소선 (globals.css).
 *  부모 label min-height 56px로 최소 탭 타깃 확보. 상태/핸들러는 호출부에서 전달. */
export function KittyCheckbox({
  label,
  className = "",
  ...props
}: {
  label: React.ReactNode;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex min-h-14 items-center gap-3 ${className}`}>
      <input type="checkbox" className="kitty" {...props} />
      <span className="kitty-check-label text-sm font-bold">{label}</span>
    </label>
  );
}
