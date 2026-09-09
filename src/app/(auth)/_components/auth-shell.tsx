import { Mascot } from "@/components/kitty/mascot";
import { StickerCard } from "@/components/kitty/sticker-card";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="kitty-paper mx-auto flex min-h-dvh max-w-[440px] items-center px-4 py-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full">
        <div className="mb-5 flex flex-col items-center text-center">
          <Mascot size={56} />
          <p className="mt-2 font-display text-xl font-semibold text-primary">FocusPlan</p>
        </div>
        <StickerCard rotate={-0.5} tape="WELCOME">
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
          {children}
        </StickerCard>
      </div>
    </main>
  );
}
