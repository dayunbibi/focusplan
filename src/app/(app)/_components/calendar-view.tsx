"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { SectionTitle } from "./section-title";
import { toneClass } from "../_lib/kitty-tones";
import type { getCalendarMonth } from "../_lib/queries";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dayLabel(year: number, month1: number, day: number) {
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month1 - 1, day)),
  );
}
const markColor = { primary: "bg-primary", now: "bg-now" } as const;

type CalendarData = Awaited<ReturnType<typeof getCalendarMonth>>;

function adjacentMonth(year: number, month: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);
  return `/calendar?year=${date.getFullYear()}&month=${date.getMonth() + 1}`;
}

export function CalendarView({ data }: { data: CalendarData }) {
  const [day, setDay] = useState(data.selectedDefault);
  const selected = data.days.find((item) => item.day === day);
  const events = selected?.events ?? [];

  return (
    <div>
      <StickerCard rotate={-0.8} tape={MONTHS[data.month1 - 1]} className="px-4">
        <div className="flex items-center justify-between">
          <Link href={adjacentMonth(data.year, data.month1, -1)} aria-label="Previous month" className="grid size-11 place-items-center rounded-full border-2 border-border text-muted">
            <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
          <h1 className="font-display text-[20px] font-semibold text-primary-strong">{data.monthLabel}</h1>
          <Link href={adjacentMonth(data.year, data.month1, 1)} aria-label="Next month" className="grid size-11 place-items-center rounded-full border-2 border-primary bg-surface-soft text-primary-strong">
            <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-3.5 grid grid-cols-7 gap-0.5">
          {weekdays.map((d, i) => (
            <span
              key={d}
              className={`text-center text-[11px] font-extrabold ${i === 0 ? "text-primary-strong" : "text-muted"}`}
            >
              {d}
            </span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-0.5">
          {Array.from({ length: data.leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {data.days.map(({ day: d, mark }) => {
            const selected = d === day;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                style={selected ? { transform: "rotate(-2deg)" } : undefined}
                className={`relative grid h-11 place-items-center rounded-[14px] text-[13.5px] tabular-nums ${
                  selected
                    ? "bg-primary font-extrabold text-white shadow-[0_2px_6px_rgba(255,127,178,0.4)]"
                    : "font-semibold text-foreground"
                }`}
              >
                {d}
                {mark && !selected && (
                  <span className={`absolute bottom-1.5 size-[5px] rounded-full ${markColor[mark]}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 border-t-2 border-dashed border-border pt-2.5 text-[10.5px] font-bold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-[7px] rounded-full bg-primary" />
            Class
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-[7px] rounded-full bg-now" />
            Due / Exam
          </span>
          <span className="flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-done" />Studied</span>
        </div>
      </StickerCard>

      <SectionTitle count={events.length ? `${events.length} event${events.length === 1 ? "" : "s"}` : undefined}>
        {dayLabel(data.year, data.month1, day)}
      </SectionTitle>
      {events.length ? (
        <div className="flex flex-col gap-2.5">
          {events.map((ev, i) => {
            const tone = toneClass[ev.tone];
            const surface = ev.tone === "done" ? "bg-done-soft" : ev.tone === "now" ? "bg-now-soft" : ev.tone === "primary" ? "bg-surface-soft" : "bg-surface";
            return (
              <div
                key={`${ev.time}-${ev.title}`}
                style={{ transform: `rotate(${i % 2 ? 0.7 : -0.6}deg)` }}
                className={`rounded-[18px] border-2 p-3.5 ${tone.border} ${surface}`}
              >
                <div className="flex gap-2.5">
                  <span className="w-[42px] flex-none text-xs font-extrabold tabular-nums text-muted">
                    {ev.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold">{ev.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted">{ev.meta}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-border px-4 py-6 text-center text-[12.5px] text-muted">
          Nothing scheduled. Enjoy the free day!
        </div>
      )}
    </div>
  );
}
