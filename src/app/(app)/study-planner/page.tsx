import type { Metadata } from "next";
import { StudyView } from "../_components/study-view";
import { getStudyPlan } from "../_lib/queries";

export const metadata: Metadata = { title: "공부 계획" };

export default async function StudyPlannerPage() {
  const data = await getStudyPlan();
  return <StudyView data={data} />;
}
