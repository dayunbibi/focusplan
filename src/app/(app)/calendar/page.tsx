import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { FeaturePlaceholder } from "../_components/feature-placeholder";

export const metadata: Metadata = { title: "캘린더" };
export default function CalendarPage() {
  return <FeaturePlaceholder title="캘린더" description="수업, 과제, 시험 일정을 한눈에 확인하세요." icon={CalendarDays} />;
}
