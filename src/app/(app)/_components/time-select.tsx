const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const totalMin = i * 15;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
});

function timeLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${String(m).padStart(2, "0")}`;
}

const fieldClass =
  "min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-2.5 text-sm text-foreground outline-none focus:border-primary";

export function TimeSelect({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}) {
  return (
    <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>
          {timeLabel(t)}
        </option>
      ))}
    </select>
  );
}
