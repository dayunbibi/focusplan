import { Mascot } from "@/components/kitty/mascot";

export default function Loading() {
  return (
    <div className="grid min-h-72 place-items-center" role="status" aria-live="polite">
      <div className="text-center">
        <Mascot size={64} className="mx-auto animate-pulse" />
        <p className="mt-3 font-display text-sm font-semibold text-primary">플래너를 펼치는 중이에요…</p>
      </div>
    </div>
  );
}
