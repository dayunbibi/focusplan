export type CourseTone = "accent" | "done" | "lav";

export interface TodayClass {
  id: string;
  course: string;
  time: string;
  location: string;
  tone: CourseTone;
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

export type Priority = "높음" | "보통" | null;

export interface Task {
  id: string;
  title: string;
  course: string | null;
  due: string;
  done: boolean;
  priority: Priority;
}

export interface CalendarEvent {
  time: string;
  title: string;
  meta: string;
  tone: CourseTone | "now" | "plain";
}
