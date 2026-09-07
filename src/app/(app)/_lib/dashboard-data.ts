import type {
  DashboardTask,
  StudyPlanItem,
  TodayClass,
  UpcomingItem,
} from "@/types/dashboard";

export const todayClasses: TodayClass[] = [
  { id: "class-1", course: "데이터 구조", time: "09:00 – 10:15", location: "공학관 301", tone: "teal" },
  { id: "class-2", course: "현대 사회와 윤리", time: "11:00 – 12:15", location: "인문관 204", tone: "violet" },
  { id: "class-3", course: "확률과 통계", time: "14:00 – 15:15", location: "자연관 112", tone: "blue" },
];

export const todayTasks: DashboardTask[] = [
  { id: "task-1", title: "연결 리스트 복습", course: "데이터 구조", due: "오전 11:00", completed: true },
  { id: "task-2", title: "통계 연습문제 5–12번", course: "확률과 통계", due: "오후 6:00", completed: false, priority: "높음" },
  { id: "task-3", title: "팀 프로젝트 자료 조사", due: "오늘", completed: false, priority: "보통" },
];

export const studyPlans: StudyPlanItem[] = [
  { id: "study-1", course: "확률과 통계", topic: "중간고사 핵심 공식 정리", time: "16:00", duration: 50, tone: "blue" },
  { id: "study-2", course: "데이터 구조", topic: "그래프 탐색 문제 풀이", time: "20:00", duration: 40, tone: "teal" },
];

export const upcomingItems: UpcomingItem[] = [
  { id: "upcoming-1", type: "과제", title: "AVL 트리 구현", course: "데이터 구조", date: "9월 10일", daysLeft: 3 },
  { id: "upcoming-2", type: "시험", title: "중간고사", course: "확률과 통계", date: "9월 14일", daysLeft: 7 },
  { id: "upcoming-3", type: "과제", title: "에세이 초안", course: "현대 사회와 윤리", date: "9월 17일", daysLeft: 10 },
];
