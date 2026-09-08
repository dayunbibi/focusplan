import type { Metadata } from "next";
import { getTasksScreen } from "../_lib/queries";
import { TasksView } from "../_components/tasks-view";

export const metadata: Metadata = { title: "할 일" };

export default async function TasksPage() {
  const { tasks, courses, assignments, exams } = await getTasksScreen();
  return <TasksView tasks={tasks} courses={courses} assignments={assignments} exams={exams} />;
}
