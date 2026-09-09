import type { Metadata } from "next";
import { CalendarView } from "../_components/calendar-view";
import { requireCurrentUser } from "@/lib/dal/auth";
import { getCalendarMonth } from "../_lib/queries";

export const metadata: Metadata = { title: "캘린더" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const params = await searchParams;
  const user = await requireCurrentUser();
  const current = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: user.timezone, year: "numeric", month: "numeric" })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const parsedYear = Number(params.year);
  const parsedMonth = Number(params.month);
  const year = Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100 ? parsedYear : Number(current.year);
  const month = Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : Number(current.month);
  const data = await getCalendarMonth(year, month);
  return <CalendarView data={data} />;
}
