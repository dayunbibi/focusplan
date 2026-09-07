"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Table2,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  tabClass: string;
  activeClass: string;
};

const navItems: NavItem[] = [
  {
    label: "TODAY",
    href: "/",
    icon: LayoutDashboard,
    tabClass: "bg-[#f9dfe7] border-[#eebdcb] text-[#80515e]",
    activeClass: "bg-[#fff8fa] text-[#8d3f58]",
  },
  {
    label: "CALENDAR",
    href: "/calendar",
    icon: CalendarDays,
    tabClass: "bg-[#f6e4ee] border-[#e8c4d5] text-[#765565]",
    activeClass: "bg-[#fff9fc] text-[#7e405d]",
  },
  {
    label: "TASKS",
    href: "/tasks",
    icon: ListTodo,
    tabClass: "bg-[#f9eadc] border-[#ebcdb2] text-[#7b5b41]",
    activeClass: "bg-[#fffaf4] text-[#7d4f2d]",
  },
  {
    label: "STUDY",
    href: "/study-planner",
    icon: BookOpenCheck,
    tabClass: "bg-[#e9e6f5] border-[#d3cbe8] text-[#625b7d]",
    activeClass: "bg-[#faf9ff] text-[#554a80]",
  },
  {
    label: "TIMETABLE",
    href: "/timetable",
    icon: Table2,
    tabClass: "bg-[#e3f0ec] border-[#c4ded5] text-[#4f6f65]",
    activeClass: "bg-[#f7fcfa] text-[#37695a]",
  },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function PlannerTabs() {
  const pathname = usePathname();
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <nav aria-label="플래너 메뉴" className="planner-tabs-scroll overflow-x-auto px-1 pt-3 sm:px-2 lg:overflow-visible lg:px-5 lg:pt-5">
      <div className="flex min-w-max items-end gap-2 lg:min-w-0 lg:justify-center lg:gap-3">
        {navItems.map(({ label, href, icon: Icon, tabClass, activeClass }) => {
          const active = isCurrentPath(pathname, href);
          return (
            <Link
              key={href}
              ref={active ? activeTabRef : undefined}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-12 min-w-[104px] shrink-0 items-center justify-center gap-2 rounded-t-[18px] border border-b-0 px-4 pb-2 pt-3 text-[11px] font-bold tracking-[0.08em] transition-[transform,background-color,color,box-shadow] duration-200 sm:min-w-[116px] sm:text-xs lg:min-h-14 lg:min-w-[132px] lg:px-5 ${tabClass} ${
                active
                  ? `-translate-y-1 shadow-[0_-5px_14px_rgba(157,91,111,0.09)] ${activeClass}`
                  : "translate-y-0 hover:-translate-y-0.5 hover:brightness-[1.02]"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {active && <span className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-current opacity-40" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
