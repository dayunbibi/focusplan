import "dotenv/config";
import { hashPassword } from "../src/lib/auth/password";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.FOCUSPLAN_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.FOCUSPLAN_USER_PASSWORD;
  if (!email || !password) throw new Error("FOCUSPLAN_USER_EMAIL and FOCUSPLAN_USER_PASSWORD are required.");
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("The password must be at least 10 characters and include a letter and a number.");
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  if (!user) throw new Error("No existing user found with that email.");
  if (user.passwordHash && process.env.FOCUSPLAN_ALLOW_PASSWORD_REPLACE !== "true") {
    throw new Error("This user already has a password. Set FOCUSPLAN_ALLOW_PASSWORD_REPLACE=true to replace it.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  console.log(`Password configured for ${email}. Existing planner data was not changed.`);
}

main().finally(() => prisma.$disconnect());
