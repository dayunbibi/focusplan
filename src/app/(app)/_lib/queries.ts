import { prisma } from "@/lib/prisma";
import {
  addDays,
  dateKey,
  dday,
  endOfTodayExclusive,
  formatDuration,
  formatDue,
  formatMonthDay,
  hhmm,
  isoWeekday,
  startOfToday,
  startOfWeek,
  todayTape,
  zonedDate,
} from "./date-utils";

export type TaskVM = {
  id: string;
  title: string;
  notes: string | null;
  courseId: string | null;
  course: string | null;
  due: string;
  dueAt: string | null;
  done: boolean;
  priority: "높음" | "보통" | null;
  priorityValue: "LOW" | "MEDIUM" | "HIGH";
};

export type CourseVM = {
  id: string;
  name: string;
  code: string | null;
  color: string;
  location: string | null;
};

const PRIORITY_KO: Record<string, "높음" | "보통" | null> = { HIGH: "높음", MEDIUM: "보통", LOW: null };

export async function getCurrentUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) throw new Error("시드 유저가 없습니다. `npm run db:seed` 를 실행하세요.");
  return user;
}

export async function getCourses() {
  const user = await getCurrentUser();
  return prisma.course.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
}

function toTaskVM(t: {
  id: string;
  title: string;
  notes: string | null;
  courseId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  priority: string;
  course: { name: string } | null;
}, timeZone: string): TaskVM {
  return {
    id: t.id,
    title: t.title,
    notes: t.notes,
    courseId: t.courseId,
    course: t.course?.name ?? null,
    due: formatDue(t.dueAt, timeZone),
    dueAt: t.dueAt?.toISOString() ?? null,
    done: t.completedAt != null,
    priority: PRIORITY_KO[t.priority] ?? null,
    priorityValue: t.priority as TaskVM["priorityValue"],
  };
}

export async function getTasks(): Promise<TaskVM[]> {
  const user = await getCurrentUser();
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    include: { course: { select: { name: true } } },
    orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }],
  });
  return tasks.map((task) => toTaskVM(task, user.timezone));
}

export async function getTodayTasks(): Promise<TaskVM[]> {
  const user = await getCurrentUser();
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      OR: [
        { dueAt: { gte: startOfToday(user.timezone), lt: endOfTodayExclusive(user.timezone) } },
        { dueAt: null, completedAt: null },
        { completedAt: { gte: startOfToday(user.timezone), lt: endOfTodayExclusive(user.timezone) } },
      ],
    },
    include: { course: { select: { name: true } } },
    orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }],
  });
  return tasks.map((task) => toTaskVM(task, user.timezone));
}

export async function getTodayClasses() {
  const user = await getCurrentUser();
  const weekday = isoWeekday(new Date(), user.timezone);
  const events = await prisma.timetableEvent.findMany({
    where: { userId: user.id, weekday },
    include: { course: { select: { name: true, location: true } } },
    orderBy: { startTime: "asc" },
  });
  const now = hhmm(new Date(), user.timezone);
  const today = dateKey(new Date(), user.timezone);
  return events
    .filter((event) =>
      (!event.startsOn || dateKey(event.startsOn, user.timezone) <= today) &&
      (!event.endsOn || dateKey(event.endsOn, user.timezone) >= today),
    )
    .map((e) => ({
    id: e.id,
    course: e.course?.name ?? e.title,
    location: e.location ?? e.course?.location ?? "",
    startTime: e.startTime,
    endTime: e.endTime,
    state: now >= e.endTime ? ("done" as const) : now >= e.startTime ? ("now" as const) : ("upcoming" as const),
    }));
}

export async function getTodaySessions() {
  const user = await getCurrentUser();
  const sessions = await prisma.studySession.findMany({
    where: {
      userId: user.id,
      plannedAt: { gte: startOfToday(user.timezone), lt: endOfTodayExclusive(user.timezone) },
    },
    include: { course: { select: { name: true } } },
    orderBy: { plannedAt: "asc" },
  });
  return sessions.map((s) => ({
    id: s.id,
    courseId: s.courseId,
    course: s.course?.name ?? "",
    title: s.title,
    time: hhmm(s.plannedAt, user.timezone),
    plannedAt: s.plannedAt.toISOString(),
    durationMin: s.durationMin,
    done: s.completedAt != null,
  }));
}

export async function getUpcoming() {
  const user = await getCurrentUser();
  const from = startOfToday(user.timezone);
  const [assignments, exams] = await Promise.all([
    prisma.assignment.findMany({
      where: { userId: user.id, dueAt: { gte: from }, completedAt: null },
      include: { course: { select: { name: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.exam.findMany({
      where: { userId: user.id, examAt: { gte: from } },
      include: { course: { select: { name: true } } },
      orderBy: { examAt: "asc" },
    }),
  ]);
  const items = [
    ...assignments.map((a) => ({
      id: a.id,
      type: "과제" as const,
      title: a.title,
      course: a.course?.name ?? "",
      date: formatMonthDay(a.dueAt, user.timezone),
      daysLeft: dday(a.dueAt, user.timezone),
    })),
    ...exams.map((e) => ({
      id: e.id,
      type: "시험" as const,
      title: e.title,
      course: e.course?.name ?? "",
      date: formatMonthDay(e.examAt, user.timezone),
      daysLeft: dday(e.examAt, user.timezone),
    })),
  ];
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

export async function getDashboard() {
  const [classes, tasks, sessions, upcoming] = await Promise.all([
    getTodayClasses(),
    getTodayTasks(),
    getTodaySessions(),
    getUpcoming(),
  ]);
  const classesDone = classes.filter((c) => c.state === "done").length;
  const tasksDone = tasks.filter((t) => t.done).length;
  const sessionsDone = sessions.filter((s) => s.done).length;
  const done = classesDone + tasksDone + sessionsDone;
  const total = classes.length + tasks.length + sessions.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const cheer =
    total > 0 && done >= total ? "오늘 계획 다 했어요!" : pct >= 60 ? "좋은 흐름이에요" : "천천히 시작해봐요";
  return {
    classes,
    tasks,
    sessions,
    upcoming: upcoming.slice(0, 4),
    focus: sessions.find((s) => !s.done) ?? null,
    progress: { done, total, pct, tasksDone },
    cheer,
    tape: todayTape((await getCurrentUser()).timezone),
  };
}

export async function getTasksScreen() {
  const user = await getCurrentUser();
  const [tasks, courses, upcoming, assignmentRows, examRows] = await Promise.all([
    getTasks(),
    getCourses(),
    getUpcoming(),
    prisma.assignment.findMany({
      where: { userId: user.id },
      include: { course: { select: { name: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.exam.findMany({
      where: { userId: user.id },
      include: { course: { select: { name: true } } },
      orderBy: { examAt: "asc" },
    }),
  ]);
  return {
    tasks,
    courses: courses satisfies CourseVM[],
    assignments: assignmentRows.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      courseId: item.courseId,
      course: item.course?.name ?? "",
      dueAt: item.dueAt.toISOString(),
      date: formatMonthDay(item.dueAt, user.timezone),
      daysLeft: dday(item.dueAt, user.timezone),
      done: item.completedAt != null,
    })),
    exams: examRows.map((item) => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      location: item.location,
      courseId: item.courseId,
      course: item.course?.name ?? "",
      examAt: item.examAt.toISOString(),
      date: formatMonthDay(item.examAt, user.timezone),
      daysLeft: dday(item.examAt, user.timezone),
    })),
    upcomingAssignments: upcoming.filter((i) => i.type === "과제"),
  };
}

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금"];

export async function getTimetable() {
  const user = await getCurrentUser();
  const [events, courseCount] = await Promise.all([
    prisma.timetableEvent.findMany({
      where: { userId: user.id },
      include: { course: { select: { name: true, location: true } } },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.course.count({ where: { userId: user.id } }),
  ]);
  const todayWeekday = isoWeekday(new Date(), user.timezone);
  const today = dateKey(new Date(), user.timezone);
  const rows = events.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    rawTitle: e.title,
    title: e.course?.name ?? e.title,
    weekday: e.weekday,
    startTime: e.startTime,
    endTime: e.endTime,
    location: e.location ?? e.course?.location ?? "",
    activeToday:
      (!e.startsOn || dateKey(e.startsOn, user.timezone) <= today) &&
      (!e.endsOn || dateKey(e.endsOn, user.timezone) >= today),
  }));
  const todayRows = rows
    .filter((r) => r.weekday === todayWeekday && r.activeToday)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  return {
    rows,
    todayRows,
    todayWeekday,
    todayLabel: todayWeekday >= 1 && todayWeekday <= 5 ? WEEKDAY_LABELS[todayWeekday - 1] : null,
    courseCount,
    eventCount: rows.length,
    courses: (await getCourses()) satisfies CourseVM[],
  };
}

export async function getStudyPlan() {
  const user = await getCurrentUser();
  const todaySessions = await getTodaySessions();
  const weekStart = startOfWeek(user.timezone);
  const weekEnd = addDays(weekStart, 7);
  const [weekSessions, examRows, managedRows] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId: user.id, plannedAt: { gte: weekStart, lt: weekEnd } },
      include: { course: { select: { name: true } } },
    }),
    prisma.exam.findMany({
      where: { userId: user.id, examAt: { gte: startOfToday(user.timezone) } },
      include: { course: { select: { name: true } } },
      orderBy: { examAt: "asc" },
      take: 1,
    }),
    prisma.studySession.findMany({
      where: { userId: user.id },
      include: { course: { select: { name: true } } },
      orderBy: [{ plannedAt: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  const byCourse = new Map<string, number>();
  for (const s of weekSessions) {
    const key = s.course?.name ?? "기타";
    byCourse.set(key, (byCourse.get(key) ?? 0) + s.durationMin);
  }
  const totalMin = [...byCourse.values()].reduce((a, b) => a + b, 0);
  const distribution = [...byCourse.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([course, min]) => ({
      course,
      hours: formatDuration(min),
      percent: totalMin ? Math.round((min / totalMin) * 100) : 0,
    }));
  const exam = examRows[0];
  return {
    sessions: managedRows.map((session) => ({
      id: session.id,
      courseId: session.courseId,
      course: session.course?.name ?? "",
      title: session.title,
      time: hhmm(session.plannedAt, user.timezone),
      date: formatMonthDay(session.plannedAt, user.timezone),
      plannedAt: session.plannedAt.toISOString(),
      durationMin: session.durationMin,
      done: session.completedAt != null,
      ai: session.source === "AI",
    })),
    sessionsDone: todaySessions.filter((session) => session.done).length,
    plannedCount: todaySessions.length,
    plannedMinutes: todaySessions.reduce((total, session) => total + session.durationMin, 0),
    weekTotalHours: formatDuration(totalMin),
    distribution,
    courses: (await getCourses()) satisfies CourseVM[],
    nextExam: exam
      ? {
          title: exam.title,
          course: exam.course?.name ?? "",
          date: formatMonthDay(exam.examAt, user.timezone),
          daysLeft: dday(exam.examAt, user.timezone),
        }
      : null,
  };
}

export type CalendarDay = { day: number; events: CalendarEventVM[]; mark: "primary" | "now" | null };
export type CalendarEventVM = { time: string; title: string; meta: string; tone: "primary" | "now" | "done" | "muted" };

export async function getCalendarMonth(year: number, month1: number) {
  const user = await getCurrentUser();
  const monthStart = zonedDate(year, month1, 1, 0, 0, user.timezone);
  const nextMonth = new Date(Date.UTC(year, month1, 1));
  const monthEnd = zonedDate(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 1, 0, 0, user.timezone);
  const [timetable, assignments, exams, sessions] = await Promise.all([
    prisma.timetableEvent.findMany({
      where: { userId: user.id },
      include: { course: { select: { name: true, location: true } } },
    }),
    prisma.assignment.findMany({
      where: { userId: user.id, dueAt: { gte: monthStart, lt: monthEnd } },
      include: { course: { select: { name: true } } },
    }),
    prisma.exam.findMany({
      where: { userId: user.id, examAt: { gte: monthStart, lt: monthEnd } },
      include: { course: { select: { name: true } } },
    }),
    prisma.studySession.findMany({
      where: { userId: user.id, plannedAt: { gte: monthStart, lt: monthEnd } },
      include: { course: { select: { name: true } } },
    }),
  ]);

  const daysInMonth = new Date(year, month1, 0).getDate();
  const leadingBlanks = new Date(Date.UTC(year, month1 - 1, 1)).getUTCDay(); // 0=일

  const days: CalendarDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month1 - 1, day));
    const iso = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
    const key = `${year}-${String(month1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events: CalendarEventVM[] = [];

    for (const t of timetable
      .filter((event) => event.weekday === iso && (!event.startsOn || dateKey(event.startsOn, user.timezone) <= key) && (!event.endsOn || dateKey(event.endsOn, user.timezone) >= key))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))) {
      events.push({
        time: t.startTime,
        title: t.course?.name ?? t.title,
        meta: `수업 · ${t.location ?? t.course?.location ?? ""}`.trim().replace(/·\s*$/, "").trim(),
        tone: "primary",
      });
    }
    for (const a of assignments.filter((item) => dateKey(item.dueAt, user.timezone) === key)) {
      events.push({ time: hhmm(a.dueAt, user.timezone), title: a.title, meta: `과제 마감 · ${a.course?.name ?? ""}`, tone: "now" });
    }
    for (const e of exams.filter((item) => dateKey(item.examAt, user.timezone) === key)) {
      events.push({ time: hhmm(e.examAt, user.timezone), title: e.title, meta: `시험 · ${e.course?.name ?? ""}`, tone: "now" });
    }
    for (const s of sessions.filter((item) => dateKey(item.plannedAt, user.timezone) === key)) {
      events.push({
        time: hhmm(s.plannedAt, user.timezone),
        title: s.title,
        meta: `공부 ${s.durationMin}분 · ${s.course?.name ?? ""}`,
        tone: s.completedAt ? "done" : "muted",
      });
    }
    events.sort((a, b) => a.time.localeCompare(b.time));

    const mark = events.some((e) => e.tone === "now") ? "now" : events.length ? "primary" : null;
    days.push({ day, events, mark });
  }

  const todayKey = dateKey(new Date(), user.timezone);
  const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);
  const selectedDefault =
    todayYear === year && todayMonth === month1
      ? todayDay
      : (days.find((d) => d.events.length)?.day ?? 1);

  return {
    year,
    month1,
    monthLabel: `${month1}월 ${year}`,
    leadingBlanks,
    days,
    selectedDefault,
  };
}

export async function getSettings() {
  const user = await getCurrentUser();
  const [courseCount, eventCount] = await Promise.all([
    prisma.course.count({ where: { userId: user.id } }),
    prisma.timetableEvent.count({ where: { userId: user.id } }),
  ]);
  return {
    name: user.name ?? "학생",
    email: user.email,
    timezone: user.timezone,
    initial: (user.name ?? user.email).trim().charAt(0).toUpperCase(),
    courseCount,
    eventCount,
    courses: (await getCourses()) satisfies CourseVM[],
  };
}
