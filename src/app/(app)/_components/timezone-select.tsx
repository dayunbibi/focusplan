"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

function tzLabel(iana: string) {
  return (iana.split("/").pop() ?? iana).replace(/_/g, " ");
}

function tzRegion(iana: string) {
  const parts = iana.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join(" / ").replace(/_/g, " ") : "";
}

let cachedZones: string[] | null = null;
function allTimezones(): string[] {
  if (cachedZones) return cachedZones;
  try {
    // ponytail: Intl.supportedValuesOf covers the full IANA db natively, no hardcoded city list to maintain
    cachedZones = Intl.supportedValuesOf("timeZone");
  } catch {
    cachedZones = ["Asia/Seoul", "Asia/Tokyo", "America/New_York", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "Europe/London", "UTC"];
  }
  return cachedZones;
}

export function TimezoneSelect({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detected, setDetected] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz !== value) setDetected(tz);
    } catch {
      /* 무시 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const zones = allTimezones();
    if (!q) return zones.slice(0, 40);
    return zones.filter((z) => z.toLowerCase().includes(q) || tzLabel(z).toLowerCase().includes(q)).slice(0, 40);
  }, [query]);

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[12px] border-2 border-border bg-surface px-3 text-left text-sm text-foreground outline-none focus:border-primary"
      >
        <span className="min-w-0 truncate">
          <span className="font-bold">{tzLabel(value)}</span>
          <span className="ml-1.5 text-[11.5px] text-muted">{value}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[16px] border-2 border-primary bg-surface shadow-[0_10px_24px_rgba(255,127,178,0.22)]">
          <div className="flex items-center gap-2 border-b-2 border-dashed border-border px-3 py-2.5">
            <Search size={14} className="shrink-0 text-muted" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="도시나 지역을 검색하세요"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1" role="listbox">
            {results.length ? (
              results.map((z) => (
                <button
                  key={z}
                  type="button"
                  role="option"
                  aria-selected={z === value}
                  onClick={() => {
                    onChange(z);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm ${
                    z === value ? "bg-surface-soft font-bold text-primary" : "text-foreground"
                  }`}
                >
                  <span className="min-w-0 truncate">
                    {tzLabel(z)}
                    <span className="ml-1.5 text-[11px] text-muted">{tzRegion(z)}</span>
                  </span>
                  {z === value && <Check size={14} className="shrink-0 text-primary" aria-hidden="true" />}
                </button>
              ))
            ) : (
              <p className="px-3.5 py-4 text-center text-[12.5px] text-muted">일치하는 지역이 없어요.</p>
            )}
          </div>
        </div>
      )}

      {detected && detected !== value && (
        <button
          type="button"
          onClick={() => {
            onChange(detected);
            setDetected(null);
          }}
          className="mt-1.5 text-[11.5px] font-bold text-primary underline decoration-dotted underline-offset-2"
        >
          현재 위치 감지: {tzLabel(detected)} ({detected}) 적용하기
        </button>
      )}
    </div>
  );
}
