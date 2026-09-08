"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { TimeSelect } from "./time-select";
import { saveClassSchedule } from "../_lib/actions";

const WEEKDAYS = [
  { label: "월", value: 1 },
  { label: "화", value: 2 },
  { label: "수", value: 3 },
  { label: "목", value: 4 },
  { label: "금", value: 5 },
];

export type ClassSlot = { key: string; weekday: number; startTime: string; endTime: string; location: string };
export type ClassGroupInitial = { courseId: string | null; name: string; eventIds: string[]; slots: ClassSlot[] };

function newSlot(overrides?: Partial<ClassSlot>): ClassSlot {
  return { key: crypto.randomUUID(), weekday: 1, startTime: "09:00", endTime: "10:15", location: "", ...overrides };
}

export function ClassScheduleForm({ initial, onClose }: { initial?: ClassGroupInitial; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [rows, setRows] = useState<ClassSlot[]>(initial?.slots.length ? initial.slots : [newSlot()]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const updateRow = (key: string, patch: Partial<ClassSlot>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));
  const addRow = () =>
    setRows((prev) => [...prev, newSlot(prev.length ? { weekday: prev[prev.length - 1].weekday } : undefined)]);

  const canSave = name.trim().length > 0 && rows.length > 0 && !pending;

  const save = () => {
    if (!canSave) return;
    start(async () => {
      const result = await saveClassSchedule({
        courseId: initial?.courseId ?? null,
        removeEventIds: initial?.eventIds ?? [],
        name,
        slots: rows.map(({ weekday, startTime, endTime, location }) => ({
          weekday,
          startTime,
          endTime,
          location: location || null,
        })),
      });
      if (result.ok) onClose();
      else setError(result.error);
    });
  };

  return (
    <div className="rounded-[18px] border-2 border-primary bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-primary">{initial ? "수업 수정" : "수업 추가"}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="grid size-9 place-items-center rounded-full border-2 border-border text-muted"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <label className="text-[11.5px] font-extrabold text-muted">
        수업 이름
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: Java Programming"
          autoFocus
          className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>

      <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">일정</p>
      {rows.length ? (
        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.key} className="rounded-[14px] border-2 border-border bg-surface-soft p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {WEEKDAYS.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => updateRow(row.key, { weekday: w.value })}
                      className={`min-h-9 min-w-9 rounded-full border-2 font-display text-[12.5px] font-semibold ${
                        row.weekday === w.value ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  aria-label="이 일정 삭제"
                  className="grid size-8 flex-none place-items-center rounded-full text-now"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <TimeSelect aria-label="시작 시간" value={row.startTime} onChange={(v) => updateRow(row.key, { startTime: v })} />
                <TimeSelect aria-label="종료 시간" value={row.endTime} onChange={(v) => updateRow(row.key, { endTime: v })} />
              </div>
              <input
                value={row.location}
                onChange={(e) => updateRow(row.key, { location: e.target.value })}
                placeholder="강의실 (선택)"
                aria-label="강의실"
                className="mt-2 min-h-10 w-full rounded-[10px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[14px] border-2 border-dashed border-border px-3 py-4 text-center text-[12px] text-muted">
          일정을 1개 이상 추가하세요.
        </p>
      )}

      <button
        type="button"
        onClick={addRow}
        className="mt-2.5 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"
      >
        <Plus size={14} aria-hidden="true" />
        시간 추가
      </button>

      {error && <p role="alert" className="mt-3 text-[12px] font-bold text-now">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white disabled:opacity-50"
      >
        <Save size={15} aria-hidden="true" />
        저장
      </button>
    </div>
  );
}
