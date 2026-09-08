/** 리본 고양이 마스코트. fill/stroke가 모두 토큰이라 다크 모드에 자동 대응.
 *  muted: 빈 상태용 회색 버전 (수염·리본·코 생략). */
export function Mascot({
  size = 52,
  muted = false,
  className,
}: {
  size?: number;
  muted?: boolean;
  className?: string;
}) {
  const stroke = muted ? "var(--muted)" : "var(--foreground)";
  const face = muted ? "var(--surface-soft)" : "var(--surface)";

  return (
    <svg
      width={size}
      height={(size * 44) / 52}
      viewBox="0 0 52 44"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 20 L7 4 L23 13 Z" fill={face} stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M42 20 L45 4 L29 13 Z" fill={face} stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M12.5 18 L11 9 L19.5 14 Z" fill="var(--primary)" />
      <path d="M39.5 18 L41 9 L32.5 14 Z" fill="var(--primary)" />
      {!muted && (
        <g stroke="var(--muted)" strokeWidth={1.6} strokeLinecap="round">
          <path d="M5 23 h11" />
          <path d="M5 28 h11" />
          <path d="M47 23 h-11" />
          <path d="M47 28 h-11" />
        </g>
      )}
      <ellipse cx="26" cy="25.5" rx="18" ry="15" fill={face} stroke={stroke} strokeWidth={2.4} />
      <circle cx="19.5" cy="25" r="1.9" fill={stroke} />
      <circle cx="32.5" cy="25" r="1.9" fill={stroke} />
      <path
        d={muted ? "M25 30 q1 -1.6 2 0" : "M25 29 q1 1.6 2 0"}
        fill="none"
        stroke={stroke}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      {!muted && <path d="M25.2 27.6 h1.6 l-.8 1.1 Z" fill="var(--primary)" />}
      {!muted && (
        <g transform="translate(40,10)">
          <path d="M0 0 L-6.5 -4.5 L-6.5 4.5 Z" fill="var(--primary)" />
          <path d="M0 0 L6.5 -4.5 L6.5 4.5 Z" fill="var(--primary)" />
          <circle r="2.1" fill="var(--surface)" />
        </g>
      )}
    </svg>
  );
}
