"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addDays, dateKey, dday, dueFromChoice, hhmm, isoWeekday, startOfToday, zonedDate } from "./date-utils";
import { getCurrentUser } from "./queries";

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

type PriorityValue = "LOW" | "MEDIUM" | "HIGH";

function isPriority(value: string): value is PriorityValue {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

function revalidateApp() {
  revalidatePath("/", "layout");
}

function clean(value: string | null | undefined) {
  return value?.trim() || null;
}

function parseDate(value: string, label: string): ActionResult<{ date: Date }> {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? { ok: false, error: `${label} 날짜와 시간을 확인하세요.` }
    : { ok: true, date };
}

async function courseBelongsToUser(userId: string, courseId: string | null) {
  if (!courseId) return true;
  return (await prisma.course.count({ where: { id: courseId, userId } })) === 1;
}

export async function toggleTask(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const task = await prisma.task.findFirst({ where: { id, userId: user.id }, select: { completedAt: true } });
  if (!task) return { ok: false, error: "할 일을 찾을 수 없어요." };
  await prisma.task.update({ where: { id }, data: { completedAt: task.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function createTask(input: {
  title: string;
  courseId: string | null;
  priority: PriorityValue;
  due: "오늘" | "내일" | "이번 주";
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "제목을 입력하세요." };
  if (!isPriority(input.priority)) return { ok: false, error: "우선순위를 확인하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  await prisma.task.create({
    data: {
      userId: user.id,
      title,
      courseId: input.courseId,
      priority: input.priority,
      dueAt: dueFromChoice(input.due, user.timezone),
    },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateTask(input: {
  id: string;
  title: string;
  notes: string | null;
  courseId: string | null;
  priority: PriorityValue;
  dueAt: string | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "제목을 입력하세요." };
  if (!isPriority(input.priority)) return { ok: false, error: "우선순위를 확인하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  let dueAt: Date | null = null;
  if (input.dueAt) {
    const parsed = parseDate(input.dueAt, "마감");
    if (!parsed.ok) return parsed;
    dueAt = parsed.date;
  }
  const updated = await prisma.task.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, notes: clean(input.notes), courseId: input.courseId, priority: input.priority, dueAt },
  });
  if (!updated.count) return { ok: false, error: "할 일을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.task.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "할 일을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function createCourse(input: {
  name: string;
  code?: string | null;
  color?: string | null;
  location: string | null;
}): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "과목 이름을 입력하세요." };
  const color = input.color && /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : "#ff7fb2";
  const course = await prisma.course.create({
    data: { userId: user.id, name, code: clean(input.code), color, location: clean(input.location) },
  });
  revalidateApp();
  return { ok: true, id: course.id };
}

export async function updateCourse(input: {
  id: string;
  name: string;
  code: string | null;
  color: string;
  location: string | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "과목 이름을 입력하세요." };
  if (!/^#[0-9a-f]{6}$/i.test(input.color)) return { ok: false, error: "과목 색상을 확인하세요." };
  const updated = await prisma.course.updateMany({
    where: { id: input.id, userId: user.id },
    data: { name, code: clean(input.code), color: input.color, location: clean(input.location) },
  });
  if (!updated.count) return { ok: false, error: "과목을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.course.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "과목을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

type ScheduleSlotInput = { weekday: number; startTime: string; endTime: string; location: string | null };

const COURSE_PALETTE = ["#ff7fb2", "#5fd0a8", "#b79bec", "#ffb86b", "#7fb2ff", "#f2a6c9"];
const VALID_TIME = /^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/;

function validateSlot(slot: ScheduleSlotInput): string | null {
  if (!VALID_TIME.test(slot.startTime) || !VALID_TIME.test(slot.endTime)) return "시간 형식이 올바르지 않습니다.";
  if (slot.endTime <= slot.startTime) return "종료 시간이 시작 시간보다 빨라요.";
  if (slot.weekday < 1 || slot.weekday > 7) return "요일이 올바르지 않습니다.";
  return null;
}

/**
 * 수업 이름 + 여러 요일/시간 일정을 한 번에 저장한다. courseId가 있으면 그 과목의
 * 이름을 갱신하고, 없으면 새 과목을 만든다(시간표 화면에서는 과목을 직접 고르지
 * 않고 이름만 입력하므로). removeEventIds에 담긴 기존 일정은 지우고 slots로 새로
 * 채워 넣는 전체 교체 방식이라, 수정 화면에서 행을 지우고 저장하면 그대로 반영된다.
 */
export async function saveClassSchedule(input: {
  courseId: string | null;
  removeEventIds: string[];
  name: string;
  slots: ScheduleSlotInput[];
}): Promise<ActionResult<{ courseId: string }>> {
  const user = await getCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "수업 이름을 입력하세요." };
  if (!input.slots.length) return { ok: false, error: "시간을 1개 이상 추가하세요." };
  for (const slot of input.slots) {
    const error = validateSlot(slot);
    if (error) return { ok: false, error };
  }

  let courseId = input.courseId;
  if (courseId) {
    const updated = await prisma.course.updateMany({ where: { id: courseId, userId: user.id }, data: { name } });
    if (!updated.count) return { ok: false, error: "과목을 찾을 수 없어요." };
  } else {
    const courseCount = await prisma.course.count({ where: { userId: user.id } });
    const course = await prisma.course.create({
      data: { userId: user.id, name, color: COURSE_PALETTE[courseCount % COURSE_PALETTE.length] },
    });
    courseId = course.id;
  }

  if (input.removeEventIds.length) {
    await prisma.timetableEvent.deleteMany({ where: { id: { in: input.removeEventIds }, userId: user.id } });
  }
  await prisma.timetableEvent.createMany({
    data: input.slots.map((slot) => ({
      userId: user.id,
      courseId,
      title: name,
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: clean(slot.location),
    })),
  });
  revalidateApp();
  return { ok: true, courseId };
}

/**
 * 일정 그룹을 통째로 삭제한다. Course → TimetableEvent 관계는 onDelete: SetNull이라
 * 과목만 지우면 일정이 "과목 없음"으로 남는다. 그래서 항상 eventIds로 일정을 직접
 * 지우고, 과목이 연결돼 있었다면 이제 일정이 없어진 그 과목도 함께 정리한다.
 */
export async function deleteClassGroup(input: { courseId: string | null; eventIds: string[] }): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!input.eventIds.length) return { ok: false, error: "삭제할 일정이 없어요." };
  await prisma.timetableEvent.deleteMany({ where: { id: { in: input.eventIds }, userId: user.id } });
  if (input.courseId) {
    await prisma.course.deleteMany({ where: { id: input.courseId, userId: user.id } });
  }
  revalidateApp();
  return { ok: true };
}

type AssignmentInput = { title: string; description: string | null; courseId: string | null; dueAt: string };

export async function createAssignment(input: AssignmentInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "과제 제목을 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  const parsed = parseDate(input.dueAt, "마감");
  if (!parsed.ok) return parsed;
  await prisma.assignment.create({
    data: { userId: user.id, title, description: clean(input.description), courseId: input.courseId, dueAt: parsed.date },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateAssignment(input: AssignmentInput & { id: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "과제 제목을 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  const parsed = parseDate(input.dueAt, "마감");
  if (!parsed.ok) return parsed;
  const updated = await prisma.assignment.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, description: clean(input.description), courseId: input.courseId, dueAt: parsed.date },
  });
  if (!updated.count) return { ok: false, error: "과제를 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function toggleAssignment(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const item = await prisma.assignment.findFirst({ where: { id, userId: user.id }, select: { completedAt: true } });
  if (!item) return { ok: false, error: "과제를 찾을 수 없어요." };
  await prisma.assignment.update({ where: { id }, data: { completedAt: item.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function deleteAssignment(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.assignment.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "과제를 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

type ExamInput = { title: string; notes: string | null; location: string | null; courseId: string | null; examAt: string };

export async function createExam(input: ExamInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "시험 제목을 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  const parsed = parseDate(input.examAt, "시험");
  if (!parsed.ok) return parsed;
  await prisma.exam.create({
    data: { userId: user.id, title, notes: clean(input.notes), location: clean(input.location), courseId: input.courseId, examAt: parsed.date },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateExam(input: ExamInput & { id: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "시험 제목을 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  const parsed = parseDate(input.examAt, "시험");
  if (!parsed.ok) return parsed;
  const updated = await prisma.exam.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, notes: clean(input.notes), location: clean(input.location), courseId: input.courseId, examAt: parsed.date },
  });
  if (!updated.count) return { ok: false, error: "시험을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function deleteExam(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.exam.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "시험을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

type StudyInput = { title: string; courseId: string | null; plannedAt: string; durationMin: number };

export async function createStudySession(input: StudyInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "공부 주제를 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  if (!Number.isInteger(input.durationMin) || input.durationMin < 5 || input.durationMin > 480) return { ok: false, error: "공부 시간은 5~480분으로 입력하세요." };
  const parsed = parseDate(input.plannedAt, "공부");
  if (!parsed.ok) return parsed;
  await prisma.studySession.create({
    data: { userId: user.id, title, courseId: input.courseId, plannedAt: parsed.date, durationMin: input.durationMin },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateStudySession(input: StudyInput & { id: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "공부 주제를 입력하세요." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  if (!Number.isInteger(input.durationMin) || input.durationMin < 5 || input.durationMin > 480) return { ok: false, error: "공부 시간은 5~480분으로 입력하세요." };
  const parsed = parseDate(input.plannedAt, "공부");
  if (!parsed.ok) return parsed;
  const updated = await prisma.studySession.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, courseId: input.courseId, plannedAt: parsed.date, durationMin: input.durationMin },
  });
  if (!updated.count) return { ok: false, error: "공부 세션을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function completeStudySession(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const updated = await prisma.studySession.updateMany({ where: { id, userId: user.id }, data: { completedAt: new Date() } });
  if (!updated.count) return { ok: false, error: "공부 세션을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function toggleStudySession(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const item = await prisma.studySession.findFirst({ where: { id, userId: user.id }, select: { completedAt: true } });
  if (!item) return { ok: false, error: "공부 세션을 찾을 수 없어요." };
  await prisma.studySession.update({ where: { id }, data: { completedAt: item.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function deleteStudySession(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.studySession.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "공부 세션을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

const AI_PLAN_HORIZON_DAYS = 7;
const AI_PLAN_SESSION_MIN = 50;
const AI_PLAN_DAY_START_MIN = 9 * 60;
const AI_PLAN_DAY_END_MIN = 23 * 60;

function timeToMin(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/**
 * 규칙 기반 자동 학습계획: 시간표와 기존 세션을 바쁜 시간으로 보고, 마감이 빠른
 * 과제·시험부터 순서대로 빈 50분 슬롯에 채운다. 재생성 시 기존 AI 세션(미완료)은
 * 지우고 다시 채우므로 여러 번 눌러도 안전하다.
 * ponytail: 마감 시각·수업 유효기간(startsOn/endsOn)은 무시하는 단순 그리디 배치. 더 정교한
 * 배분(우선순위, 공부량 추정)이 필요해지면 슬롯 탐색 로직을 교체한다.
 */
export async function generateAiStudyPlan(): Promise<ActionResult<{ created: number }>> {
  const user = await getCurrentUser();
  const tz = user.timezone;
  const today = startOfToday(tz);
  const horizonEnd = addDays(today, AI_PLAN_HORIZON_DAYS);

  await prisma.studySession.deleteMany({
    where: { userId: user.id, source: "AI", completedAt: null, plannedAt: { gte: today, lt: horizonEnd } },
  });

  const [assignments, exams, timetable, existingSessions] = await Promise.all([
    prisma.assignment.findMany({ where: { userId: user.id, completedAt: null, dueAt: { gte: today, lt: horizonEnd } } }),
    prisma.exam.findMany({ where: { userId: user.id, examAt: { gte: today, lt: horizonEnd } } }),
    prisma.timetableEvent.findMany({ where: { userId: user.id } }),
    prisma.studySession.findMany({ where: { userId: user.id, plannedAt: { gte: today, lt: horizonEnd } } }),
  ]);

  const busyByDay = new Map<string, [number, number][]>();
  const addBusy = (key: string, start: number, end: number) => {
    const list = busyByDay.get(key) ?? [];
    list.push([start, end]);
    list.sort((a, b) => a[0] - b[0]);
    busyByDay.set(key, list);
  };
  for (let i = 0; i < AI_PLAN_HORIZON_DAYS; i++) {
    const date = addDays(today, i);
    const key = dateKey(date, tz);
    const weekday = isoWeekday(date, tz);
    for (const ev of timetable) {
      if (ev.weekday === weekday) addBusy(key, timeToMin(ev.startTime), timeToMin(ev.endTime));
    }
  }
  for (const s of existingSessions) {
    const key = dateKey(s.plannedAt, tz);
    const start = timeToMin(hhmm(s.plannedAt, tz));
    addBusy(key, start, start + s.durationMin);
  }

  function findSlot(dayIndex: number): { key: string; startMin: number } | null {
    const key = dateKey(addDays(today, dayIndex), tz);
    let cursor = AI_PLAN_DAY_START_MIN;
    for (const [busyStart, busyEnd] of busyByDay.get(key) ?? []) {
      if (cursor + AI_PLAN_SESSION_MIN <= busyStart) break;
      if (cursor < busyEnd) cursor = busyEnd;
    }
    return cursor + AI_PLAN_SESSION_MIN <= AI_PLAN_DAY_END_MIN ? { key, startMin: cursor } : null;
  }

  type WorkItem = { title: string; courseId: string | null; deadline: Date; sessionsNeeded: number };
  const items: WorkItem[] = [
    ...assignments.map((a) => ({ title: `${a.title} 준비`, courseId: a.courseId, deadline: a.dueAt, sessionsNeeded: 2 })),
    ...exams.map((e) => ({ title: `${e.title} 시험 공부`, courseId: e.courseId, deadline: e.examAt, sessionsNeeded: 3 })),
  ].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  const rows: { userId: string; courseId: string | null; title: string; plannedAt: Date; durationMin: number; source: "AI" }[] = [];
  for (const item of items) {
    const deadlineDay = Math.min(AI_PLAN_HORIZON_DAYS - 1, Math.max(0, dday(item.deadline, tz)));
    let placed = 0;
    for (let day = 0; day <= deadlineDay && placed < item.sessionsNeeded; day++) {
      const slot = findSlot(day);
      if (!slot) continue;
      addBusy(slot.key, slot.startMin, slot.startMin + AI_PLAN_SESSION_MIN);
      const [year, month, dayOfMonth] = slot.key.split("-").map(Number);
      rows.push({
        userId: user.id,
        courseId: item.courseId,
        title: item.title,
        plannedAt: zonedDate(year, month, dayOfMonth, Math.floor(slot.startMin / 60), slot.startMin % 60, tz),
        durationMin: AI_PLAN_SESSION_MIN,
        source: "AI",
      });
      placed++;
    }
  }

  if (rows.length) await prisma.studySession.createMany({ data: rows });
  revalidateApp();
  return { ok: true, created: rows.length };
}

export async function updateProfile(input: { name: string; timezone: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  const name = clean(input.name);
  const timezone = clean(input.timezone);
  if (!name || !timezone) return { ok: false, error: "이름과 시간대를 입력하세요." };
  try {
    Intl.DateTimeFormat("ko-KR", { timeZone: timezone }).format();
  } catch {
    return { ok: false, error: "올바른 IANA 시간대를 입력하세요." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { name, timezone } });
  revalidateApp();
  return { ok: true };
}
