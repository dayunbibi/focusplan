"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/dal/auth";
import {
  courseBelongsToUser,
  getOwnedAssignmentCompletion,
  getOwnedStudySessionCompletion,
  getOwnedTaskCompletion,
} from "@/lib/dal/authorization";
import { addDays, dateKey, dday, dueFromChoice, hhmm, isoWeekday, startOfToday, zonedDate, type DueChoice } from "./date-utils";
import { isPastelColor, paletteColorAt } from "./course-colors";

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
    ? { ok: false, error: `Please check the ${label} date and time.` }
    : { ok: true, date };
}

export async function toggleTask(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const task = await getOwnedTaskCompletion(user.id, id);
  if (!task) return { ok: false, error: "Task not found." };
  await prisma.task.updateMany({ where: { id, userId: user.id }, data: { completedAt: task.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function createTask(input: {
  title: string;
  courseId: string | null;
  priority: PriorityValue;
  due: DueChoice;
}): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter a title." };
  if (!isPriority(input.priority)) return { ok: false, error: "Please choose a valid priority." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
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
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter a title." };
  if (!isPriority(input.priority)) return { ok: false, error: "Please choose a valid priority." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  let dueAt: Date | null = null;
  if (input.dueAt) {
    const parsed = parseDate(input.dueAt, "due");
    if (!parsed.ok) return parsed;
    dueAt = parsed.date;
  }
  const updated = await prisma.task.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, notes: clean(input.notes), courseId: input.courseId, priority: input.priority, dueAt },
  });
  if (!updated.count) return { ok: false, error: "Task not found." };
  revalidateApp();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const deleted = await prisma.task.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Task not found." };
  revalidateApp();
  return { ok: true };
}

export async function createCourse(input: {
  name: string;
  code?: string | null;
  color?: string | null;
  location: string | null;
}): Promise<ActionResult<{ id: string }>> {
  const user = await requireCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "Please enter a course name." };
  const color = isPastelColor(input.color) ? input.color : paletteColorAt(await prisma.course.count({ where: { userId: user.id } }));
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
  const user = await requireCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "Please enter a course name." };
  if (!isPastelColor(input.color)) return { ok: false, error: "Please choose a color from the palette." };
  const updated = await prisma.course.updateMany({
    where: { id: input.id, userId: user.id },
    data: { name, code: clean(input.code), color: input.color, location: clean(input.location) },
  });
  if (!updated.count) return { ok: false, error: "Course not found." };
  revalidateApp();
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const deleted = await prisma.course.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Course not found." };
  revalidateApp();
  return { ok: true };
}

type ScheduleSlotInput = { weekday: number; startTime: string; endTime: string; location: string | null };

const VALID_TIME = /^(?:[01]\d|2[0-3]):(?:0[05]|[1-5][05])$/;

function validateSlot(slot: ScheduleSlotInput): string | null {
  if (!VALID_TIME.test(slot.startTime) || !VALID_TIME.test(slot.endTime)) return "Invalid time format.";
  if (slot.endTime <= slot.startTime) return "End time must be after the start time.";
  if (slot.weekday < 1 || slot.weekday > 7) return "Invalid day of the week.";
  return null;
}

/**
 * Saves a class name with several weekday/time slots in one go. With a courseId the
 * course is renamed; otherwise a new course is created (the timetable screen only asks
 * for a name, not a course). Events in removeEventIds are deleted and replaced by
 * `slots`, so rows removed in the edit form disappear on save.
 */
export async function saveClassSchedule(input: {
  courseId: string | null;
  removeEventIds: string[];
  name: string;
  color: string | null;
  slots: ScheduleSlotInput[];
}): Promise<ActionResult<{ courseId: string }>> {
  const user = await requireCurrentUser();
  const name = clean(input.name);
  if (!name) return { ok: false, error: "Please enter a class name." };
  if (!input.slots.length) return { ok: false, error: "Please add at least one time slot." };
  for (const slot of input.slots) {
    const error = validateSlot(slot);
    if (error) return { ok: false, error };
  }
  if (input.color && !isPastelColor(input.color)) return { ok: false, error: "Please choose a color from the palette." };

  const saved = await prisma.$transaction(async (tx) => {
    let courseId = input.courseId;
    if (courseId) {
      const updated = await tx.course.updateMany({
        where: { id: courseId, userId: user.id },
        data: { name, ...(input.color ? { color: input.color } : {}) },
      });
      if (!updated.count) return { ok: false as const };
    } else {
      const courseCount = await tx.course.count({ where: { userId: user.id } });
      const course = await tx.course.create({
        data: { userId: user.id, name, color: input.color ?? paletteColorAt(courseCount) },
      });
      courseId = course.id;
    }

    if (input.removeEventIds.length) {
      await tx.timetableEvent.deleteMany({ where: { id: { in: input.removeEventIds }, userId: user.id } });
    }
    await tx.timetableEvent.createMany({
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
    return { ok: true as const, courseId };
  });
  if (!saved.ok) return { ok: false, error: "Course not found." };
  revalidateApp();
  return { ok: true, courseId: saved.courseId };
}

/**
 * Deletes timetable events only. Courses are also used by tasks, assignments, exams,
 * and study sessions, so they are kept when their classes are removed.
 */
export async function deleteClassGroup(input: { courseId: string | null; eventIds: string[] }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  if (!input.eventIds.length) return { ok: false, error: "Nothing to delete." };
  const deleted = await prisma.timetableEvent.deleteMany({ where: { id: { in: input.eventIds }, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Class not found." };
  revalidateApp();
  return { ok: true };
}

type AssignmentInput = { title: string; description: string | null; courseId: string | null; dueAt: string };

export async function createAssignment(input: AssignmentInput): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter an assignment title." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  const parsed = parseDate(input.dueAt, "due");
  if (!parsed.ok) return parsed;
  await prisma.assignment.create({
    data: { userId: user.id, title, description: clean(input.description), courseId: input.courseId, dueAt: parsed.date },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateAssignment(input: AssignmentInput & { id: string }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter an assignment title." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  const parsed = parseDate(input.dueAt, "due");
  if (!parsed.ok) return parsed;
  const updated = await prisma.assignment.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, description: clean(input.description), courseId: input.courseId, dueAt: parsed.date },
  });
  if (!updated.count) return { ok: false, error: "Assignment not found." };
  revalidateApp();
  return { ok: true };
}

export async function toggleAssignment(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const item = await getOwnedAssignmentCompletion(user.id, id);
  if (!item) return { ok: false, error: "Assignment not found." };
  await prisma.assignment.updateMany({ where: { id, userId: user.id }, data: { completedAt: item.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function deleteAssignment(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const deleted = await prisma.assignment.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Assignment not found." };
  revalidateApp();
  return { ok: true };
}

type ExamInput = { title: string; notes: string | null; location: string | null; courseId: string | null; examAt: string };

export async function createExam(input: ExamInput): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter an exam title." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  const parsed = parseDate(input.examAt, "exam");
  if (!parsed.ok) return parsed;
  await prisma.exam.create({
    data: { userId: user.id, title, notes: clean(input.notes), location: clean(input.location), courseId: input.courseId, examAt: parsed.date },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateExam(input: ExamInput & { id: string }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter an exam title." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  const parsed = parseDate(input.examAt, "exam");
  if (!parsed.ok) return parsed;
  const updated = await prisma.exam.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, notes: clean(input.notes), location: clean(input.location), courseId: input.courseId, examAt: parsed.date },
  });
  if (!updated.count) return { ok: false, error: "Exam not found." };
  revalidateApp();
  return { ok: true };
}

export async function deleteExam(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const deleted = await prisma.exam.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Exam not found." };
  revalidateApp();
  return { ok: true };
}

type StudyInput = { title: string; courseId: string | null; plannedAt: string; durationMin: number };

export async function createStudySession(input: StudyInput): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter a study topic." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  if (!Number.isInteger(input.durationMin) || input.durationMin < 5 || input.durationMin > 480) return { ok: false, error: "Study time must be between 5 and 480 minutes." };
  const parsed = parseDate(input.plannedAt, "study session");
  if (!parsed.ok) return parsed;
  await prisma.studySession.create({
    data: { userId: user.id, title, courseId: input.courseId, plannedAt: parsed.date, durationMin: input.durationMin },
  });
  revalidateApp();
  return { ok: true };
}

export async function updateStudySession(input: StudyInput & { id: string }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Please enter a study topic." };
  if (!(await courseBelongsToUser(user.id, input.courseId))) return { ok: false, error: "Course not found." };
  if (!Number.isInteger(input.durationMin) || input.durationMin < 5 || input.durationMin > 480) return { ok: false, error: "Study time must be between 5 and 480 minutes." };
  const parsed = parseDate(input.plannedAt, "study session");
  if (!parsed.ok) return parsed;
  const updated = await prisma.studySession.updateMany({
    where: { id: input.id, userId: user.id },
    data: { title, courseId: input.courseId, plannedAt: parsed.date, durationMin: input.durationMin },
  });
  if (!updated.count) return { ok: false, error: "Study session not found." };
  revalidateApp();
  return { ok: true };
}

export async function completeStudySession(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const updated = await prisma.studySession.updateMany({ where: { id, userId: user.id }, data: { completedAt: new Date() } });
  if (!updated.count) return { ok: false, error: "Study session not found." };
  revalidateApp();
  return { ok: true };
}

export async function toggleStudySession(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const item = await getOwnedStudySessionCompletion(user.id, id);
  if (!item) return { ok: false, error: "Study session not found." };
  await prisma.studySession.updateMany({ where: { id, userId: user.id }, data: { completedAt: item.completedAt ? null : new Date() } });
  revalidateApp();
  return { ok: true };
}

export async function deleteStudySession(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const deleted = await prisma.studySession.deleteMany({ where: { id, userId: user.id } });
  if (!deleted.count) return { ok: false, error: "Study session not found." };
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
 * Rule-based study plan: treats classes and existing sessions as busy time and fills
 * free 50-minute slots with the earliest assignments and exams first. Regenerating
 * deletes the unfinished auto-generated sessions first, so it is safe to run repeatedly.
 * Limitation: a simple greedy fill that ignores exact due times and class date ranges
 * (startsOn/endsOn). Replace the slot search if smarter scheduling is needed.
 */
export async function generateAiStudyPlan(): Promise<ActionResult<{ created: number }>> {
  const user = await requireCurrentUser();
  const tz = user.timezone;
  const today = startOfToday(tz);
  const horizonEnd = addDays(today, AI_PLAN_HORIZON_DAYS);

  const created = await prisma.$transaction(async (tx) => {
    await tx.studySession.deleteMany({
      where: { userId: user.id, source: "AI", completedAt: null, plannedAt: { gte: today, lt: horizonEnd } },
    });

    const [assignments, exams, timetable, existingSessions] = await Promise.all([
      tx.assignment.findMany({ where: { userId: user.id, completedAt: null, dueAt: { gte: today, lt: horizonEnd } } }),
      tx.exam.findMany({ where: { userId: user.id, examAt: { gte: today, lt: horizonEnd } } }),
      tx.timetableEvent.findMany({ where: { userId: user.id } }),
      tx.studySession.findMany({ where: { userId: user.id, plannedAt: { gte: today, lt: horizonEnd } } }),
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
      ...assignments.map((a) => ({ title: `Prep: ${a.title}`, courseId: a.courseId, deadline: a.dueAt, sessionsNeeded: 2 })),
      ...exams.map((e) => ({ title: `Study for ${e.title}`, courseId: e.courseId, deadline: e.examAt, sessionsNeeded: 3 })),
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

    if (rows.length) await tx.studySession.createMany({ data: rows });
    return rows.length;
  });
  revalidateApp();
  return { ok: true, created };
}

export async function updateProfile(input: { name: string; timezone: string }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const name = clean(input.name);
  const timezone = clean(input.timezone);
  if (!name || !timezone) return { ok: false, error: "Please enter your name and timezone." };
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format();
  } catch {
    return { ok: false, error: "Please enter a valid IANA timezone." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { name, timezone } });
  revalidateApp();
  return { ok: true };
}
