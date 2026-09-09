import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSessionToken } from "@/lib/auth/session";
import { hashSessionToken } from "@/lib/auth/token";

const currentUser = cache(async () => {
  const token = await readSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      userId: true,
      expiresAt: true,
      user: { select: { id: true, email: true, name: true, timezone: true, createdAt: true, updatedAt: true } },
    },
  });

  if (!session || session.expiresAt <= new Date() || session.user.id !== session.userId) return null;
  return session.user;
});

export async function getOptionalCurrentUser() {
  return currentUser();
}

export async function requireCurrentUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
