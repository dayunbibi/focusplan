import "dotenv/config";
import { hashPassword } from "../src/lib/auth/password";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.FOCUSPLAN_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.FOCUSPLAN_USER_PASSWORD;
  if (!email || !password) throw new Error("FOCUSPLAN_USER_EMAIL과 FOCUSPLAN_USER_PASSWORD가 필요합니다.");
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("비밀번호는 영문자와 숫자를 포함해 10자 이상이어야 합니다.");
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  if (!user) throw new Error("해당 이메일의 기존 사용자를 찾을 수 없습니다.");
  if (user.passwordHash && process.env.FOCUSPLAN_ALLOW_PASSWORD_REPLACE !== "true") {
    throw new Error("이미 비밀번호가 있습니다. 교체하려면 FOCUSPLAN_ALLOW_PASSWORD_REPLACE=true를 명시하세요.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  console.log(`Password configured for ${email}. Existing planner data was not changed.`);
}

main().finally(() => prisma.$disconnect());
