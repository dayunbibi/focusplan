import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.FOCUSPLAN_USER_EMAIL ?? "student@focusplan.local";
  const name = process.env.FOCUSPLAN_USER_NAME ?? "학생";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, timezone: "Asia/Seoul" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
