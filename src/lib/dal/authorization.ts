import "server-only";

import { prisma } from "@/lib/prisma";

export async function courseBelongsToUser(userId: string, courseId: string | null) {
  if (!courseId) return true;
  return (await prisma.course.count({ where: { id: courseId, userId } })) === 1;
}

export async function getOwnedTaskCompletion(userId: string, id: string) {
  return (await prisma.task.findMany({ where: { id, userId }, select: { completedAt: true }, take: 1 }))[0] ?? null;
}

export async function getOwnedAssignmentCompletion(userId: string, id: string) {
  return (await prisma.assignment.findMany({ where: { id, userId }, select: { completedAt: true }, take: 1 }))[0] ?? null;
}

export async function getOwnedStudySessionCompletion(userId: string, id: string) {
  return (await prisma.studySession.findMany({ where: { id, userId }, select: { completedAt: true }, take: 1 }))[0] ?? null;
}
