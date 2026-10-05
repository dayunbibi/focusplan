"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

const ITEM_H = 40;
const PAD = ITEM_H * 2;
const PERIODS = ["a.m.", "p.m."];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/** "13:30" → "1:30 p.m." (en-CA style) */
function formatTime12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? PERIODS[0] : PERIODS[1];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Splits a stored "HH:mm" into wheel indexes: hour (1-12), minute (5-min steps), and a.m./p.m. */
function decompose(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const periodIdx = h >= 12 ? 1 : 0;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const roundedMin = (Math.round(m / 5) * 5) % 60;
  return { periodIdx, hourIdx: h12 - 1, minuteIdx: Math.max(MINUTES.indexOf(String(roundedMin).padStart(2, "0")), 0) };
}

function compose(periodIdx: number, hourIdx: number, minuteIdx: number) {
  let h = Number(HOURS[hourIdx]) % 12;
  if (periodIdx === 1) h += 12;
  return `${String(h).padStart(2, "0")}:${MINUTES[minuteIdx]}`;
}

function WheelColumn({ options, selected, onSettle }: { options: string[]; selected: number; onSettle: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: selected * ITEM_H });
    // Scroll to the stored value once, when the picker first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const settle = () => {
      const idx = Math.min(Math.max(Math.round(el.scrollTop / ITEM_H), 0), options.length - 1);
      onSettle(idx);
    };
    // scrollend fires exactly when scrolling (including the native snap animation) stops.
    // A debounce fallback covers older browsers.
    let fallback: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(fallback);
      fallback = setTimeout(settle, 160);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", settle);
    return () => {
      clearTimeout(fallback);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", settle);
    };
  }, [options.length, onSettle]);

  const goTo = (i: number) => ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });

  return (
    <div
      ref={ref}
      className="wheel-scroll h-[200px] w-full overflow-y-scroll"
      style={{ scrollSnapType: "y mandatory" }}
    >
      <div style={{ height: PAD }} aria-hidden="true" />
      {options.map((opt, i) => {
        const dist = Math.abs(i - selected);
        return (
          <button
            key={opt}
            type="button"
            tabIndex={-1}
            onClick={() => goTo(i)}
            style={{ height: ITEM_H, scrollSnapAlign: "center", opacity: Math.max(1 - dist * 0.4, 0.22) }}
            className={`flex w-full items-center justify-center font-display tabular-nums transition-[opacity,color] ${
              dist === 0 ? "text-[19px] font-bold text-primary" : "text-[15px] font-semibold text-muted"
            }`}
          >
            {opt}
          </button>
        );
      })}
      <div style={{ height: PAD }} aria-hidden="true" />
    </div>
  );
}

function TimeWheelPicker({ value, onConfirm, onCancel }: { value: string; onConfirm: (v: string) => void; onCancel: () => void }) {
  const init = decompose(value);
  const [periodIdx, setPeriodIdx] = useState(init.periodIdx);
  const [hourIdx, setHourIdx] = useState(init.hourIdx);
  const [minuteIdx, setMinuteIdx] = useState(init.minuteIdx);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[var(--veil)] [animation:kitty-rise_.15s_ease]" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a time"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[26px] border-2 border-b-0 border-border bg-surface p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-14px_34px_rgba(255,127,178,0.24)] [animation:kitty-sheet_.26s_cubic-bezier(.22,1,.36,1)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[260px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[22px] sm:border-b-2 sm:p-3.5 sm:shadow-[0_16px_36px_rgba(255,127,178,0.28)] sm:[animation:kitty-rise_.18s_ease]"
      >
        <span className="mx-auto mb-3 block h-[5px] w-11 rounded-full bg-border sm:hidden" aria-hidden="true" />
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-10 -translate-y-1/2 rounded-[12px] border-2 border-primary bg-surface-soft/70" aria-hidden="true" />
          <div className="relative z-10 mx-auto grid w-[210px] grid-cols-3 gap-1">
            <WheelColumn options={HOURS} selected={hourIdx} onSettle={setHourIdx} />
            <WheelColumn options={MINUTES} selected={minuteIdx} onSettle={setMinuteIdx} />
            <WheelColumn options={PERIODS} selected={periodIdx} onSettle={setPeriodIdx} />
          </div>
        </div>
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-border bg-surface font-display text-sm font-semibold text-muted"
          >
            <X size={15} aria-hidden="true" />
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(compose(periodIdx, hourIdx, minuteIdx))}
            className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white"
          >
            <Check size={15} aria-hidden="true" />
            Done
          </button>
        </div>
      </div>
    </>
  );
}

export function TimeSelect({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center justify-center rounded-[12px] border-2 border-border bg-surface px-2.5 text-sm font-bold tabular-nums text-foreground outline-none focus:border-primary"
      >
        {formatTime12(value)}
      </button>
      {open && (
        <TimeWheelPicker
          value={value}
          onConfirm={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
