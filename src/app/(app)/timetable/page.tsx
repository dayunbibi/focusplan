import type { Metadata } from "next";
import { getTimetable } from "../_lib/queries";
import { TimetableView } from "../_components/timetable-view";

export const metadata: Metadata = { title: "시간표" };

export default async function TimetablePage() {
  const data = await getTimetable();
  return <TimetableView data={data} />;
}
