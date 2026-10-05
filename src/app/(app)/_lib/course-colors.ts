/** Pastel palette for courses. No saturated or dark colors. */
export const COURSE_PALETTE = [
  { name: "Lavender", hex: "#C9B8F0" },
  { name: "Mint", hex: "#B7E4C7" },
  { name: "Peach", hex: "#FFD3B0" },
  { name: "Baby Blue", hex: "#BEE3F8" },
  { name: "Butter Yellow", hex: "#FCE9A8" },
  { name: "Soft Coral", hex: "#FFB8AC" },
  { name: "Rose", hex: "#F6C6DA" },
  { name: "Soft Lilac", hex: "#E0C3F0" },
] as const;

/** Pastel backgrounds have similar brightness, so text uses a fixed ink color in both light and dark themes. */
export const COURSE_INK = "#3d2438";
export const COURSE_INK_MUTED = "rgba(61, 36, 56, 0.66)";
export const COURSE_DANGER = "#b3413d";

export function isPastelColor(hex: string | null | undefined): hex is string {
  return !!hex && COURSE_PALETTE.some((c) => c.hex.toLowerCase() === hex.toLowerCase());
}

export function paletteColorAt(index: number): string {
  const n = COURSE_PALETTE.length;
  return COURSE_PALETTE[((index % n) + n) % n].hex;
}

/** Legacy events without a course still get a stable color derived from their name. */
export function fallbackColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return paletteColorAt(hash);
}
