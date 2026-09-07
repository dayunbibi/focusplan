import type { Metadata } from "next";
import { ListTodo } from "lucide-react";
import { FeaturePlaceholder } from "../_components/feature-placeholder";

export const metadata: Metadata = { title: "할 일" };
export default function TasksPage() {
  return <FeaturePlaceholder title="할 일" description="해야 할 일을 과목과 우선순위별로 정리하세요." icon={ListTodo} />;
}
