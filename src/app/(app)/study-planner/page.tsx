import type { Metadata } from "next";
import { StudyView } from "../_components/study-view";
import { getStudyPlan } from "../_lib/queries";

export const metadata: Metadata = { title: "Study Planner" };

export default async function StudyPlannerPage() {
  const data = await getStudyPlan();
  return <StudyView data={data} />;
}
