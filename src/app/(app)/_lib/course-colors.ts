/** 시간표 전용 파스텔 팔레트. 원색/진한 색은 쓰지 않는다. */
export const COURSE_PALETTE = [
  { name: "라벤더", hex: "#C9B8F0" },
  { name: "민트", hex: "#B7E4C7" },
  { name: "피치", hex: "#FFD3B0" },
  { name: "베이비 블루", hex: "#BEE3F8" },
  { name: "버터 옐로", hex: "#FCE9A8" },
  { name: "소프트 코럴", hex: "#FFB8AC" },
  { name: "로즈", hex: "#F6C6DA" },
  { name: "소프트 라일락", hex: "#E0C3F0" },
] as const;

/** 파스텔 배경은 밝기가 항상 비슷해서, 라이트/다크 테마와 무관하게 고정된 잉크 색을 쓴다. */
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

/** 과목이 연결되지 않은 레거시 일정도 이름 기반으로 항상 같은 색을 안정적으로 받는다. */
export function fallbackColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return paletteColorAt(hash);
}
