/** Tone mapping for the reduced palette. The background is always surface-soft; tones differ only by border, text, and dot colors. */
export const toneClass = {
  primary: { border: "border-primary", text: "text-primary", dot: "bg-primary" },
  now: { border: "border-now", text: "text-now", dot: "bg-now" },
  done: { border: "border-done", text: "text-done", dot: "bg-done" },
  muted: { border: "border-border", text: "text-muted", dot: "bg-muted" },
} as const;

export type ToneKey = keyof typeof toneClass;
