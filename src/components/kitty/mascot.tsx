import Image from "next/image";
/** Poipi's clover cat, shared by headers, auth and empty states. */
export function Mascot({
  size = 52,
  muted = false,
  className = "",
}: {
  size?: number;
  muted?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="https://homesick-games.vercel.app/images/face.webp"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      unoptimized
      className={`poipi-mascot ${className}`}
      style={{
        width: size,
        height: size,
        opacity: muted ? 0.55 : 1,
        filter: muted ? "grayscale(.65)" : undefined,
      }}
    />
  );
}
