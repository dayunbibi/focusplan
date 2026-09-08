"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Mascot } from "@/components/kitty/mascot";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="grid min-h-72 place-items-center rounded-[22px] border-2 border-dashed border-border bg-surface px-6 text-center">
      <div>
        <Mascot size={72} muted className="mx-auto" />
        <h1 className="mt-4 font-display text-lg font-semibold text-primary">플래너를 불러오지 못했어요</h1>
        <p className="mt-2 text-sm text-muted">데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.</p>
        <button type="button" onClick={reset} className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-full border-2 border-primary bg-primary px-5 text-sm font-bold text-white"><RefreshCw size={16} aria-hidden="true" />다시 시도</button>
      </div>
    </div>
  );
}
