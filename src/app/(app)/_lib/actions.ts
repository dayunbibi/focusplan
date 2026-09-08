"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dueFromChoice } from "./date-utils";
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

type TimetableInput = {
  courseId: string | null;
  title: string;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string | null;
};

function validateTimetable(input: TimetableInput): string | null {
  if (!clean(input.title)) return "수업 이름을 입력하세요.";
  const validTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!validTime(input.startTime) || !validTime(input.endTime)) return "시간 형식이 올바르지 않습니다.";
  if (input.endTime <= input.startTime) return "종료 시간이 시작 시간보다 빨라요.";
  if (input.weekday < 1 || input.weekday > 7) return "요일이 올바르지 않습니다.";
  return null;
}

export async function createTimetableEvent(input: TimetableInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  const error = validateTimetable(input);
  if (error) return { ok: false, error };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  await prisma.timetableEvent.create({
    data: { ...input, title: input.title.trim(), location: clean(input.location), userId: user.id },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateTimetableEvent(input: TimetableInput & { id: string }): Promise<ActionResult> {
  const user = await getCurrentUser();
  const error = validateTimetable(input);
  if (error) return { ok: false, error };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "과목을 찾을 수 없어요." };
  const updated = await prisma.timetableEvent.updateMany({
    where: { id: input.id, userId: user.id },
    data: {
      courseId: input.courseId,
      title: input.title.trim(),
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      location: clean(input.location),
    },
  });
  if (!updated.count) return { ok: false, error: "수업을 찾을 수 없어요." };
  revalidateApp();
  return { ok: true };
}

export async function deleteTimetableEvent(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  const deleted = await prisma.timetableEvent.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "수업을 찾을 수 없어요." };
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
