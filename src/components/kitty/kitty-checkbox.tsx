/** Heart checkbox with a label. When checked, the label turns --muted with a strike-through (globals.css).
 *  The parent label's 56px min-height keeps the tap target large enough. State and handlers come from the caller. */
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
