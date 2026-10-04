import "dotenv/config";
import { addDays, dateKey, isoWeekday, zonedDate } from "../src/app/(app)/_lib/date-utils";
import { hashPassword } from "../src/lib/auth/password";
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD, DEMO_TIMEZONE } from "../src/lib/demo";
import { prisma } from "../src/lib/prisma";

const tz = DEMO_TIMEZONE;

// Noon today in the demo timezone. Starting from noon keeps addDays() on the right
// calendar day even when a DST change happens inside the range.
function todayNoon() {
  const [year, month, day] = dateKey(new Date(), tz).split("-").map(Number);
  return zonedDate(year, month, day, 12, 0, tz);
}

// A date `offset` days from today at the given local time
function at(offset: number, hour: number, minute = 0) {
  const [year, month, day] = dateKey(addDays(todayNoon(), offset), tz).split("-").map(Number);
  return zonedDate(year, month, day, hour, minute, tz);
}

// Days until the next given ISO weekday (1 = Mon ... 7 = Sun), 0 if it's today
function daysUntil(weekday: number) {
  return (weekday - isoWeekday(todayNoon(), tz) + 7) % 7;
}

const COURSES = [
  { key: "mobile", name: "Mobile App Development", code: "CPAN 214", color: "#C9B8F0", location: "H-215" },
  { key: "web", name: "Web Development with Next.js", code: "CPAN 212", color: "#B7E4C7", location: "B-312" },
  { key: "db", name: "Database Design", code: "CPAN 211", color: "#FFD3B0", location: "E-104" },
  { key: "testing", name: "Software Testing", code: "CPAN 213", color: "#BEE3F8", location: "LRC-220" },
  { key: "comm", name: "Business Communication", code: "COMM 200", color: "#FCE9A8", location: "J-101" },
] as const;

type CourseKey = (typeof COURSES)[number]["key"];

const TIMETABLE: { course: CourseKey; weekday: number; startTime: string; endTime: string }[] = [
  { course: "mobile", weekday: 1, startTime: "09:00", endTime: "11:00" },
  { course: "db", weekday: 1, startTime: "13:00", endTime: "15:00" },
  { course: "web", weekday: 2, startTime: "10:00", endTime: "12:00" },
  { course: "comm", weekday: 2, startTime: "14:00", endTime: "15:30" },
  { course: "testing", weekday: 3, startTime: "09:30", endTime: "11:30" },
  { course: "mobile", weekday: 3, startTime: "13:00", endTime: "14:00" },
  { course: "web", weekday: 4, startTime: "10:00", endTime: "12:00" },
  { course: "db", weekday: 4, startTime: "15:00", endTime: "16:00" },
  { course: "testing", weekday: 5, startTime: "11:00", endTime: "12:30" },
];

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // Upsert by email so the demo user is never duplicated. The password and profile
  // are reset too, in case a visitor changed the name or timezone.
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: DEMO_NAME, timezone: tz, passwordHash },
    create: { email: DEMO_EMAIL, name: DEMO_NAME, timezone: tz, passwordHash },
  });

  await prisma.$transaction(async (tx) => {
    // Wipe the demo user's planner data and rebuild it, so re-running the seed
    // gives a fresh demo instead of piling up copies.
    const where = { userId: user.id };
    await tx.studySession.deleteMany({ where });
    await tx.exam.deleteMany({ where });
    await tx.assignment.deleteMany({ where });
    await tx.task.deleteMany({ where });
    await tx.timetableEvent.deleteMany({ where });
    await tx.course.deleteMany({ where });

    const courseIds = {} as Record<CourseKey, string>;
    for (const { key, ...course } of COURSES) {
      const created = await tx.course.create({ data: { ...course, userId: user.id } });
      courseIds[key] = created.id;
    }
    const courseOf = (key: CourseKey) => COURSES.find((c) => c.key === key)!;

    await tx.timetableEvent.createMany({
      data: TIMETABLE.map((slot) => ({
        userId: user.id,
        courseId: courseIds[slot.course],
        title: courseOf(slot.course).name,
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: courseOf(slot.course).location,
      })),
    });

    type SeedTask = {
      title: string;
      courseId: string | null;
      priority: "LOW" | "MEDIUM" | "HIGH";
      dueAt: Date | null;
      completedAt?: Date;
    };
    const tasks: SeedTask[] = [
      { title: "Review lecture notes on React Navigation", courseId: courseIds.mobile, priority: "HIGH", dueAt: at(0, 18) },
      { title: "Email group about presentation slides", courseId: courseIds.comm, priority: "MEDIUM", dueAt: at(0, 20) },
      { title: "Buy a new notebook", courseId: null, priority: "LOW", dueAt: null },
      { title: "Practice SQL JOIN exercises", courseId: courseIds.db, priority: "MEDIUM", dueAt: at(1, 21) },
      { title: "Set up Jest for the lab project", courseId: courseIds.testing, priority: "HIGH", dueAt: at(3, 17) },
      { title: "Watch Next.js server actions tutorial", courseId: courseIds.web, priority: "LOW", dueAt: at(-1, 19), completedAt: at(-1, 18) },
      { title: "Print lab 4 rubric", courseId: courseIds.mobile, priority: "MEDIUM", dueAt: at(0, 9), completedAt: at(0, 8, 30) },
    ];
    await tx.task.createMany({ data: tasks.map((task) => ({ ...task, userId: user.id })) });

    await tx.assignment.createMany({
      data: [
        { title: "Lab 5: Expo Camera App", courseId: courseIds.mobile, dueAt: at(2, 23, 55), description: "Build a camera screen with permissions and a photo preview." },
        { title: "ERD and Normalization Report", courseId: courseIds.db, dueAt: at(5, 23, 55), description: "Design the schema for a library system up to 3NF." },
        { title: "Portfolio Site Milestone 2", courseId: courseIds.web, dueAt: at(9, 17), description: "Add dynamic routes and deploy to Vercel." },
        { title: "Persuasive Memo", courseId: courseIds.comm, dueAt: at(13, 12), description: null },
        { title: "Lab 4: Navigation Stack", courseId: courseIds.mobile, dueAt: at(-2, 23, 55), description: null, completedAt: at(-3, 21) },
      ].map((assignment) => ({ ...assignment, userId: user.id })),
    });

    // Exams land on a class day so the calendar looks realistic
    await tx.exam.createMany({
      data: [
        { title: "Database Design Midterm", courseId: courseIds.db, examAt: at(daysUntil(1) + 7, 13), location: "E-104", notes: "Chapters 1-6, bring a calculator" },
        { title: "Software Testing Quiz 2", courseId: courseIds.testing, examAt: at(daysUntil(5) + 7, 11), location: "LRC-220", notes: null },
      ].map((exam) => ({ ...exam, userId: user.id })),
    });

    await tx.studySession.createMany({
      data: [
        // Today: one done, two planned
        { title: "React Native state management", courseId: courseIds.mobile, plannedAt: at(0, 16), durationMin: 50, completedAt: at(0, 16, 50) },
        { title: "SQL subqueries practice", courseId: courseIds.db, plannedAt: at(0, 19), durationMin: 45 },
        { title: "Write test cases for login form", courseId: courseIds.testing, plannedAt: at(0, 21), durationMin: 30, source: "AI" as const },
        // Rest of the week
        { title: "Expo Camera lab prep", courseId: courseIds.mobile, plannedAt: at(1, 18), durationMin: 60 },
        { title: "Normalization examples", courseId: courseIds.db, plannedAt: at(2, 19), durationMin: 50, source: "AI" as const },
        { title: "Next.js dynamic routes", courseId: courseIds.web, plannedAt: at(3, 18, 30), durationMin: 45 },
        // Earlier sessions that were finished
        { title: "Flexbox layout review", courseId: courseIds.mobile, plannedAt: at(-1, 17), durationMin: 40, completedAt: at(-1, 17, 40) },
        { title: "Memo outline", courseId: courseIds.comm, plannedAt: at(-2, 15), durationMin: 30, completedAt: at(-2, 15, 30) },
      ].map((session) => ({ ...session, userId: user.id })),
    });
  });

  const counts = await Promise.all([
    prisma.course.count({ where: { userId: user.id } }),
    prisma.timetableEvent.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id } }),
    prisma.assignment.count({ where: { userId: user.id } }),
    prisma.exam.count({ where: { userId: user.id } }),
    prisma.studySession.count({ where: { userId: user.id } }),
  ]);
  console.log(
    `Seeded ${DEMO_EMAIL}: ${counts[0]} courses, ${counts[1]} classes, ${counts[2]} tasks, ` +
      `${counts[3]} assignments, ${counts[4]} exams, ${counts[5]} study sessions`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
