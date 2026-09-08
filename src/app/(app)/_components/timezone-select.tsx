"use client";

import { useEffect } from "react";

// 개인용 앱이라 한국·캐나다 시간대만 지원한다. IANA 문자열은 화면에 노출하지 않는다.
const TIMEZONES = [
  { label: "Toronto", tz: "America/Toronto" },
  { label: "Vancouver", tz: "America/Vancouver" },
  { label: "Calgary", tz: "America/Edmonton" },
  { label: "Seoul", tz: "Asia/Seoul" },
];

export function TimezoneSelect({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const isKnown = TIMEZONES.some((t) => t.tz === value);

  useEffect(() => {
    if (isKnown) return;
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const match = TIMEZONES.find((t) => t.tz === browserTz);
      if (match) onChange(match.tz);
    } catch {
      /* 무시 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKnown]);

  return (
    <select
      value={isKnown ? value : TIMEZONES[0].tz}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
    >
      {TIMEZONES.map((t) => (
        <option key={t.tz} value={t.tz}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
