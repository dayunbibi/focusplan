export type CourseTone = "teal" | "blue" | "violet" | "amber" | "rose";

export interface TodayClass {
  id: string;
  course: string;
  time: string;
  location: string;
  tone: CourseTone;
}

export interface DashboardTask {
  id: string;
  title: string;
  course?: string;
  due: string;
  completed: boolean;
  priority?: "높음" | "보통";
}

export interface StudyPlanItem {
  id: string;
  course: string;
  topic: string;
  time: string;
  duration: number;
  tone: CourseTone;
}

export interface UpcomingItem {
  id: string;
  type: "과제" | "시험";
  title: string;
  course: string;
  date: string;
  daysLeft: number;
}
