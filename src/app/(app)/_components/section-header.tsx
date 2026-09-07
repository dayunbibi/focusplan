import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionHeader({ title, href, label = "전체 보기" }: { title: string; href: string; label?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
      <h2 className="text-base font-bold tracking-[-0.02em] sm:text-lg">{title}</h2>
      <Link href={href} className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft">
        {label}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}
