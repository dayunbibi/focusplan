import type { Metadata } from "next";
import { BookOpenCheck } from "lucide-react";
import { FeaturePlaceholder } from "../_components/feature-placeholder";

export const metadata: Metadata = { title: "공부 계획" };
export default function StudyPlannerPage() {
  return <FeaturePlaceholder title="공부 계획" description="집중 세션을 계획하고 학습 흐름을 기록하세요." icon={BookOpenCheck} />;
}
