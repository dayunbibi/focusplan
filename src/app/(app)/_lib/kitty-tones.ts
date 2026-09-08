/** 축소 팔레트 톤 매핑. 배경은 항상 surface-soft, 구분은 border/text/dot 색으로만. */
export const toneClass = {
  primary: { border: "border-primary", text: "text-primary", dot: "bg-primary" },
  now: { border: "border-now", text: "text-now", dot: "bg-now" },
  done: { border: "border-done", text: "text-done", dot: "bg-done" },
  muted: { border: "border-border", text: "text-muted", dot: "bg-muted" },
} as const;

export type ToneKey = keyof typeof toneClass;
