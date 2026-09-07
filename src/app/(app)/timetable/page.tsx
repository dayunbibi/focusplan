import type { Metadata } from "next";
import { Table2 } from "lucide-react";
import { FeaturePlaceholder } from "../_components/feature-placeholder";

export const metadata: Metadata = { title: "시간표" };
export default function TimetablePage() {
  return <FeaturePlaceholder title="시간표" description="이번 학기 수업 시간과 강의실을 관리하세요." icon={Table2} />;
}
