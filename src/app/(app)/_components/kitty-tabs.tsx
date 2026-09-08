"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Table2,
  type LucideIcon,
} from "lucide-react";

const tabs: { label: string; href: string; icon: LucideIcon; rotate: number }[] = [
  { label: "투데이", href: "/", icon: LayoutDashboard, rotate: -1.5 },
  { label: "할 일", href: "/tasks", icon: ListTodo, rotate: 0.8 },
  { label: "시간표", href: "/timetable", icon: Table2, rotate: -0.6 },
  { label: "공부", href: "/study-planner", icon: BookOpenCheck, rotate: 1 },
  { label: "캘린더", href: "/calendar", icon: CalendarDays, rotate: 0 },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function KittyTabs() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="플래너 메뉴" className="tabs-scroll flex gap-[7px] overflow-x-auto px-2.5 pt-2.5">
      {tabs.map(({ label, href, icon: Icon, rotate }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            ref={active ? activeRef : undefined}
            href={href}
            aria-current={active ? "page" : undefined}
            style={{ transform: `${active ? "translateY(-3px) " : ""}rotate(${rotate}deg)` }}
            className={`flex min-h-11 flex-none items-center gap-1.5 rounded-t-[18px] border-2 border-b-0 font-display text-[13px] transition-transform ${
              active
                ? "border-primary bg-primary px-[18px] font-semibold text-white"
                : "border-border bg-surface-soft px-4 font-medium text-muted"
            }`}
          >
            <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
