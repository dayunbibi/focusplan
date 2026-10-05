"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { TimeSelect } from "./time-select";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { deleteClassGroup, saveClassSchedule } from "../_lib/actions";
import { COURSE_DANGER } from "../_lib/course-colors";

const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
];

export type ClassSlot = { key: string; weekday: number; startTime: string; endTime: string; location: string };
export type ClassGroupInitial = { courseId: string | null; name: string; color: string; eventIds: string[]; slots: ClassSlot[] };

function newSlot(overrides?: Partial<ClassSlot>): ClassSlot {
  return { key: crypto.randomUUID(), weekday: 1, startTime: "09:00", endTime: "10:15", location: "", ...overrides };
}

export function ClassScheduleForm({
  initial,
  defaultColor,
  onClose,
  bare = false,
}: {
  initial?: ClassGroupInitial;
  defaultColor: string;
  onClose: () => void;
  /** Inside a bottom sheet: the sheet already provides the card background and header, so skip our own border and header. */
  bare?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? defaultColor);
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
        color,
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

  const remove = () => {
    if (!initial) return;
    if (!window.confirm(`Delete “${initial.name}”? All ${initial.slots.length} of its time slots will be removed.`)) return;
    start(async () => {
      const result = await deleteClassGroup({ courseId: initial.courseId, eventIds: initial.eventIds });
      if (result.ok) onClose();
      else setError(result.error);
    });
  };

  const body = (
    <>
      {!bare && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-primary">{initial ? "Edit class" : "Add class"}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full border-2 border-border text-muted"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <label className="text-[11.5px] font-extrabold text-muted">
        Class name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Java Programming"
          autoFocus
          className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </label>

      <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">Color</p>
      <ColorSwatchPicker value={color} onChange={setColor} />

      <p className="mb-1.5 mt-4 text-[11.5px] font-extrabold text-muted">Schedule</p>
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
                  aria-label="Remove this time slot"
                  className="grid size-8 flex-none place-items-center rounded-full text-now"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <TimeSelect aria-label="Start time" value={row.startTime} onChange={(v) => updateRow(row.key, { startTime: v })} />
                <TimeSelect aria-label="End time" value={row.endTime} onChange={(v) => updateRow(row.key, { endTime: v })} />
              </div>
              <input
                value={row.location}
                onChange={(e) => updateRow(row.key, { location: e.target.value })}
                placeholder="Room (optional)"
                aria-label="Room"
                className="mt-2 min-h-10 w-full rounded-[10px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[14px] border-2 border-dashed border-border px-3 py-4 text-center text-[12px] text-muted">
          Add at least one time slot.
        </p>
      )}

      <button
        type="button"
        onClick={addRow}
        className="mt-2.5 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-primary bg-surface-soft text-xs font-bold text-primary"
      >
        <Plus size={14} aria-hidden="true" />
        Add time slot
      </button>

      {error && <p role="alert" className="mt-3 text-[12px] font-bold text-now">{error}</p>}

      <div className="mt-4 flex gap-2.5">
        {initial && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            style={{ borderColor: COURSE_DANGER, color: COURSE_DANGER }}
            className="flex min-h-[46px] flex-none items-center justify-center gap-1.5 rounded-full border-2 px-4 font-display text-sm font-semibold disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary font-display text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save size={15} aria-hidden="true" />
          Save
        </button>
      </div>
    </>
  );

  return bare ? body : <div className="rounded-[18px] border-2 border-primary bg-surface p-4">{body}</div>;
}
