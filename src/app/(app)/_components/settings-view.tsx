"use client";

import { useEffect, useState, useTransition } from "react";
import {
  BookOpenCheck,
  ChevronRight,
  GraduationCap,
  LogOut,
  Save,
  User,
  type LucideIcon,
} from "lucide-react";
import { StickerCard } from "@/components/kitty/sticker-card";
import { SectionTitle } from "./section-title";
import { CourseManager } from "./course-manager";
import { TimezoneSelect } from "./timezone-select";
import { updateProfile } from "../_lib/actions";
import { logout } from "@/app/(auth)/_lib/actions";
import type { getSettings } from "../_lib/queries";

const THEMES = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

type SettingsData = Awaited<ReturnType<typeof getSettings>>;

function Row({
  icon: Icon,
  title,
  desc,
  trailing,
  last,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  trailing: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${last ? "" : "border-b-2 border-dashed border-border"}`}>
      <span className="grid size-[38px] flex-none place-items-center rounded-xl bg-surface-soft text-primary-strong">
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-muted">{desc}</p>
      </div>
      {trailing}
    </div>
  );
}

export function SettingsView({ data }: { data: SettingsData }) {
  const [theme, setTheme] = useState("system");
  const [name, setName] = useState(data.name);
  const [timezone, setTimezone] = useState(data.timezone);
  const [profileMessage, setProfileMessage] = useState("");
  const [profilePending, startProfile] = useTransition();

  // 브라우저 전용 저장소를 마운트 후 1회 읽어 반영 (SSR 값과 다를 수 있음)
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(localStorage.getItem("focusplan-theme") || "system");
    } catch {
      /* 무시 */
    }
  }, []);

  const pickTheme = (value: string) => {
    setTheme(value);
    try {
      localStorage.setItem("focusplan-theme", value);
      document.documentElement.setAttribute("data-theme", value);
    } catch {
      /* 무시 */
    }
  };

  const academicRows: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: GraduationCap, title: "과목 · 시간표", desc: `과목 ${data.courseCount}개 · 수업 ${data.eventCount}개` },
    { icon: BookOpenCheck, title: "기본 세션 길이", desc: "50분 · 새 공부 계획의 기본값" },
    { icon: User, title: "시간대", desc: data.timezone },
  ];

  const saveProfile = () => startProfile(async () => {
    const result = await updateProfile({ name, timezone });
    setProfileMessage(result.ok ? "프로필을 저장했어요." : result.error);
  });

  return (
    <div>
      <StickerCard rotate={-1} tape="SETTINGS">
        <div className="flex items-center gap-3.5">
          <span className="grid size-[58px] flex-none place-items-center rounded-full border-2 border-primary bg-surface-soft font-display text-[22px] font-semibold text-primary-strong">
            {data.initial}
          </span>
          <div className="min-w-0">
            <p className="font-display text-[19px] font-semibold">{data.name}</p>
            <p className="mt-0.5 text-xs text-muted">{data.email}</p>
          </div>
        </div>
      </StickerCard>

      <SectionTitle>프로필</SectionTitle>
      <div className="rounded-[18px] border-2 border-border bg-surface p-4">
        <div className="flex flex-col gap-2.5">
          <label className="text-[11.5px] font-extrabold text-muted">이름<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-11 w-full rounded-[12px] border-2 border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
          <label className="text-[11.5px] font-extrabold text-muted">시간대<TimezoneSelect value={timezone} onChange={setTimezone} /></label>
          {profileMessage && <p aria-live="polite" className={`text-xs font-bold ${profileMessage.includes("저장") ? "text-done" : "text-now"}`}>{profileMessage}</p>}
          <button type="button" onClick={saveProfile} disabled={profilePending || !name.trim() || !timezone.trim()} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-primary bg-primary text-sm font-bold text-white disabled:opacity-50"><Save size={15} aria-hidden="true" />프로필 저장</button>
        </div>
      </div>

      <SectionTitle>테마</SectionTitle>
      <div className="flex gap-[7px]">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => pickTheme(t.value)}
            className={`min-h-11 flex-1 rounded-full border-2 font-display text-[13px] font-semibold ${
              theme === t.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SectionTitle>학업</SectionTitle>
      <div
        style={{ transform: "rotate(0.6deg)" }}
        className="rounded-[18px] border-2 border-border bg-surface px-4 shadow-[0_2px_6px_rgba(255,127,178,0.14)]"
      >
        {academicRows.map((r, i) => (
          <Row
            key={r.title}
            icon={r.icon}
            title={r.title}
            desc={r.desc}
            last={i === academicRows.length - 1}
            trailing={<ChevronRight size={17} strokeWidth={2.2} className="text-muted" aria-hidden="true" />}
          />
        ))}
      </div>

      <SectionTitle count={`${data.courses.length}개`}>과목 관리</SectionTitle>
      <CourseManager courses={data.courses} />

      <form action={logout} className="mt-5">
        <button type="submit" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-surface text-sm font-bold text-primary-strong">
          <LogOut size={16} aria-hidden="true" />
          로그아웃
        </button>
      </form>

      <p className="mt-4 text-center text-[11.5px] text-muted">FocusPlan · MVP 0.1</p>
    </div>
  );
}
