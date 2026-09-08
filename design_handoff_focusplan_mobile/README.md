# Handoff: FocusPlan 모바일 (Kitty kawaii pink)

## Overview
학생용 플래너 FocusPlan을 **모바일 앱웹**으로 다시 디자인한 결과물입니다.
기존 Next.js 앱(`focusplan`)의 데이터·정보구조를 그대로 쓰면서, 시각 언어를 "Kitty" kawaii pink
디자인 시스템(Fredoka/Nunito, 핑크 accent, 하트 체크박스, 종이 탭, 스티커 카드)으로 교체했습니다.
투데이·할 일·시간표·공부 계획·캘린더·설정·온보딩·집중 타이머·할 일 추가 시트를 포함합니다.

## About the Design Files
이 번들의 HTML 파일은 **디자인 레퍼런스**입니다 — 의도한 모양·동작을 보여주는 프로토타입이며
그대로 복사해 배포할 프로덕션 코드가 아닙니다.
목표는 이 디자인을 **대상 코드베이스(focusplan: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 + Prisma 7 + lucide-react)의
기존 패턴으로 재구현**하는 것입니다. 파일은 브라우저에서 바로 열립니다.

## Fidelity
**High-fidelity.** 색·타이포·간격·라운드·그림자·인터랙션이 모두 최종값입니다.
아래 토큰과 수치를 그대로 사용해 픽셀 단위로 재현하세요. 아이콘은 이미 저장소에 있는
`lucide-react`(v1.42.0) 아이콘을 사용했으므로, 재구현 시에도 인라인 SVG가 아니라 `lucide-react` 컴포넌트를 쓰면 됩니다.

## Screens / Views

프레임: 폭 100%(최대 440px), 높이 100dvh, 세로 flex.
구조는 모든 화면 공통: **상단바(58px) → 종이 탭(가로 스크롤) → 본문(스크롤, 라운드 22px 22px 0 0 · 상단 보더 2px · 점 그리드 배경)**.

### 1. 온보딩 (3단)
- 목적: 첫 실행 안내 후 앱 진입. `localStorage.onboarded`로 1회만.
- 레이아웃: padding 34/26/30, 상단 브랜드+건너뛰기, 중앙 마스코트 스티커 카드(회전 -1.6°, 라운드 26, 보더 2px `--line`, 그림자 `--shadow`), 하단 CTA 2개.
- 요소: 마스킹테이프 라벨(WELCOME/PLAN/FOCUS, 점선 2px `--accent`, 배경 `--accent-soft`, 10px/800, letter-spacing .1em), D-3(peach)·완료!(mint) 스티커, 제목 Fredoka 600 28px/1.28 `--accent-ink`, 본문 Nunito 14px/1.6 `--muted`, 인디케이터(활성 26×8, 비활성 8×8, 라운드 999).
- CTA: 알약 56px, 배경 `--accent`, 텍스트 #fff, 보더 2px `--accent-ink`, 그림자 0 8px 20px rgba(255,127,178,.35).

### 2. 투데이 (대시보드)
- 목적: 오늘 진행률·다음 할 일 한눈에.
- 요소 순서: 인사 스티커 카드(회전 -1.2°, 테이프 "9 · 7 · MON") → 진행률(Fredoka 600 34px + 하트 아이콘 n개, 채움 `--accent`/빈칸 `--accent-soft`, 15×15, 캡션 "N개 중 M개 완료 · 응원문구") → 포커스 카드(peach: 보더/배경 `--now`/`--now-soft`, 회전 +0.9°, 타이머 시작 버튼) → 오늘 수업(가로 스크롤 카드 152px, 현재 수업만 peach + "지금" 배지) → 오늘 할 일(스티커 카드 목록 + 하트 체크박스) → 오늘 공부 계획(2열 버튼 카드, 탭하면 타이머) → 다가오는 일정(D-day 알약).
- 카드 회전은 index별 -0.7° / +0.6° / -0.4° 순환.

### 3. 할 일
- 헤더 카드(테이프 "TO · DO", 제목 "할 일 n/m", 남은 개수) → 필터 칩(전체·오늘·과목 3개, 활성=핑크 채움) → 목록 → 빈 상태(회색 마스코트 + 점선 카드) → 과제 마감 2건(D-3 peach, D-10 기본).
- 우측 하단 FAB 60×60(핑크, 보더 2px `--accent-ink`, 그림자 0 8px 20px rgba(255,127,178,.45)).

### 4. 시간표
- 헤더 카드(테이프 "MY TIMETABLE") → 주간 그리드: `grid-template-columns: 30px repeat(5,1fr)`, 행 높이 58px, 행 구분 2px dashed `--accent-soft`, 오늘(월) 열 헤더는 핑크 알약.
- 수업 블록: `position:absolute; inset:2px`, 보더 2px 과목색, 배경 과목 soft, 라운드 12, 10.5px/800, 회전 ±1°.
- 과목색: 데이터 구조 = `--done`/`--done-soft`/`--done-ink`, 현대 사회와 윤리 = `--lav` 계열, 확률과 통계 = `--accent`/`--surface-2`/`--accent-ink`.
- 아래 오늘 수업 카드 3개(위치는 MapPin 12px).
- 주의: 저장소 데이터에는 `TimetableEvent.weekday = 1`(월) 3건만 있어 화~금은 의도적으로 비워 두고 안내 문구를 넣었습니다.

### 5. 공부 계획
- 헤더 카드(테이프 "STUDY LOG", "오늘 2세션 · 1시간 30분 · 완료 n/2") + 요약 2칸(이번 주 / 완료 세션).
- 오늘 세션 2개: 과목 배지 + 제목 + 시각/분, 첫 세션에 "지금 시작"(핑크 알약), 두 번째는 "먼저 시작하기"(윤곽 알약).
- 과목별 이번 주 배분: 라벨 + 10px 알약 진행바(핑크/민트/라벤더, 배경 `--accent-soft`).
- 다가오는 시험 카드(peach 보더 + AlarmClock + D-7).

### 6. 캘린더
- 월 헤더(◀ ▶ + "9월 2026", 테이프 "SEPTEMBER") → 요일 행 → 날짜 그리드 7열, 셀 44px, 선택일 = 핑크 채움 + 회전 -2° + 그림자, 일정 있는 날은 하단 5px 점(수업 핑크 / 과제·시험 peach / 제출 라벤더).
- 아래: 선택일 일정 카드(시각 42px 고정폭 + 제목 + 메타), 없으면 점선 빈 상태.

### 7. 설정
- 프로필 카드(58px 아바타, 이름, `User.email`) → 테마 3분할(시스템/라이트/다크) → 알림 3토글(48×28 트랙, 20px 노브) → 학업 3행(과목·시간표 / 기본 세션 길이 / 시간대) → "온보딩 다시 보기".
- 스키마에 없는 필드(학과, 학기, 주 시작 요일)는 넣지 않았습니다. 표시 값은 `User.email`, `User.timezone`, `Course`/`TimetableEvent` 개수, `StudySession.durationMin` 기준.

### 8. 집중 타이머 (전체화면 오버레이)
- 상단: 닫기(X) + 과목 알약. 중앙: 세션 제목/메타 + 링 카운트다운(SVG 240 viewBox, r=104, stroke-width 16, dasharray 653.45, 남은 비율만큼 dashoffset), 숫자 Fredoka 600 50px `--accent-ink`, 상태 라벨(집중 중/대기 중/세션 완료).
- 컨트롤: 리셋(52px 윤곽) · 시작·일시정지(152×56 핑크) · 완료(52px 민트).
- 하단: "이 세션에서 할 것" 미완료 할 일 2개 체크리스트. 오버레이는 `overflow-y:auto`.

### 9. 할 일 추가 (바텀 시트)
- 배경 `--veil` + 시트(라운드 26 26 0 0, 보더 2px, 애니메이션 `kitty-sheet` 0.26s cubic-bezier(.22,1,.36,1)).
- 필드: 제목 텍스트 인풋(알약, 보더 2px `--accent`, 링 0 0 0 3px `--accent-soft`) / 과목 칩 4개 / 우선순위 3개 / 마감 3개 / 취소·추가하기.
- 제목이 비면 추가 버튼 opacity .5 + `cursor:not-allowed`.

## Interactions & Behavior
- 탭 전환: 즉시(전환 애니메이션 없음). 활성 탭은 `translateY(-3px)` + 핑크 채움, 비활성은 회전만(±0.6~1.5°).
- 체크박스: 체크 시 `kitty-pop` 0.32s, 제목 색 `--muted` + 취소선, 진행률·하트·필터 즉시 갱신.
- 할 일 추가: 시트 닫힘 → 목록 상단 반영 → "할 일을 추가했어요" 토스트(민트, 2.2초, `kitty-rise`).
- 타이머: 1초 간격 setInterval, 일시정지/이어서/리셋, 0초 도달 시 자동 정지. "완료" 누르면 세션 완료 +1 → 진행률 반영 + 토스트.
- 캘린더 날짜 탭 → 해당 일자 일정 렌더.
- 테마: 시스템/라이트/다크 → 루트 `data-theme` 속성 전환(웹에선 `<html data-theme>`).
- 버튼 hover: `transform: translateY(-1px)`. 포커스: `outline: 3px solid var(--lav); outline-offset: 2px`.
- `prefers-reduced-motion: reduce`에서 모든 트랜지션·애니메이션 해제.

## State Management
프로토타입에서 쓴 상태(그대로 옮기면 됩니다):
- `route`: today | tasks | timetable | study | calendar | settings → Next.js에서는 기존 라우트(`/`, `/tasks`, `/timetable`, `/study-planner`, `/calendar`, `/settings`)로 대체.
- `tasks: Task[]` (id, title, course, due, done, priority) → Prisma `Task`(`completedAt`으로 done 표현, `priority: Priority`).
- `filter`(전체/오늘/과목), `sheetOpen`, `draftTitle/draftCourse/draftPriority/draftDue`.
- `focusOpen`, `focusIndex`, `secs`, `running`, `sessionsDone` → `StudySession.completedAt`, `durationMin`.
- `theme`, `notifClass/notifTask/notifStudy`, `calDay`, `onboarded`, `obStep`.
- 진행률 = (수업 종료 수 + 완료 할 일 + 완료 세션) / (수업 3 + 할 일 수 + 세션 2). 화면 문구는 반드시 이 계산값에 바인딩(하드코딩 금지).
- 프로토타입은 `localStorage["focusplan-kitty-v1"]`에 onboarded/theme/tasks/sessionsDone/알림 설정을 저장 — 실제 앱에서는 Prisma + 서버 액션으로 교체하고, 테마만 localStorage 유지 권장.

## Design Tokens
전체는 `globals.kitty.css`에 그대로 들어 있습니다(기존 `src/app/globals.css`의 `:root`/`@theme inline` 교체용).

라이트: bg #fff4f8 · surface #ffffff · surface-2 #ffe7f1 · ink #5c3a4b · muted #b47f96 · line #ffd3e3 ·
accent #ff7fb2 · accent-soft #ffe1ec · accent-ink #e0568c · now #ff9f6b(soft #ffeede, ink #b4551a) ·
done #5fd0a8(soft #eafaf4, ink #1d7a5f) · lav #b79bec(soft #f4f0ff, ink #5c4a8a).

다크: bg #2a1622 · surface #361d2c · surface-2 #45283a · ink #ffe3ef · muted #cd9fb5 · line #4f2e41 ·
accent #ff93bf · accent-soft #4a2a3c · accent-ink #ffb6d4 · now #ffb884 · done #6ed7b4 · lav #c3acf3.

- 라운드: 카드/컨테이너 22px, 다이얼로그·시트 26px, 작은 블록 12~18px, 버튼·탭·칩·인풋 999px(알약).
- 보더: 2px solid `--line`. 목록 구분선: 2px dashed `--line`.
- 그림자: `--shadow` = 0 2px 6px rgba(255,127,178,.14), 0 14px 34px rgba(255,127,178,.16). 카드 단독은 0 2px 6px rgba(255,127,178,.14).
- 타이포: Fredoka 500/600 = 제목·브랜드·버튼/탭 라벨 / Nunito 400·700·800 = 본문·라벨. 크기: h1 22~28, 섹션 15, 본문 13~14, 메타 11.5~12.5, 배지 10~11.5. 숫자·시간에는 `font-variant-numeric: tabular-nums`.
- 간격: 화면 좌우 16, 카드 내부 14~20, 카드 사이 10, 섹션 사이 22.
- 최소 탭 타깃 44px(체크박스 21px는 부모 라벨 min-height 56px로 확보).

## Assets
- 아이콘: `lucide-react` v1.42.0 (이미 `package.json`에 있음) — Bell, Settings, Check, Heart, MapPin, Clock3, BookOpen, BookOpenCheck, AlarmClock, CalendarClock, CalendarDays, ListTodo, LayoutDashboard, Table2, Plus, Play, Pause, RotateCcw, X, ChevronLeft/Right/Down, ArrowRight, ArrowUpRight, Flame, CircleCheckBig, User, Moon, GraduationCap. 굵기 1.8(일반) / 2~2.4(강조·컨트롤).
- 마스코트: 리본 고양이 인라인 SVG(52×44 viewBox). `fill`이 모두 토큰이라 다크 모드에 자동 대응. 빈 상태에는 `--muted` 회색 버전 사용. 소스는 `FocusPlan App.dc.html` 안에 있으며 그대로 `components/kitty-mascot.tsx`로 옮기면 됩니다.
- 이미지 없음(모두 CSS/SVG).

## Files
- `FocusPlan App.dc.html` — 최종 인터랙티브 앱(모든 화면·상태·다크 모드). **이 파일이 기준입니다.**
- `FocusPlan Mobile.dc.html` — 탐색 과정: turn 1은 현재 웹 대시보드의 모바일 재현 + 시각 방향 3안, turn 2는 선택안(스티커 다이어리)으로 만든 8개 화면 시안.
- `globals.kitty.css` — `src/app/globals.css` 교체용 토큰/전역 스타일.

## 구현 순서 제안
1. `globals.css`를 `globals.kitty.css`로 교체 → 기존 화면이 자동으로 새 팔레트를 입습니다(토큰 이름 유지).
2. `layout.tsx`에 Fredoka/Nunito 로드(next/font 또는 `<link>`), `<html data-theme>` 제어 추가.
3. `app-shell.tsx`: 상단바 + 종이 탭을 Kitty 버전으로(탭 라벨은 한글, 활성 탭 핑크 채움 + translateY(-3px)).
4. 공통 프리미티브 추출: `StickerCard`(회전 각도 prop), `TapeLabel`, `Pill`(버튼/칩), `KittyCheckbox`, `Mascot`.
5. 대시보드 카드들을 새 레이아웃으로 교체 → `/tasks`, `/timetable`, `/study-planner`, `/calendar`, `/settings` 순서로 구현(현재 `FeaturePlaceholder` 대체).
6. 바텀 시트·집중 타이머·토스트는 클라이언트 컴포넌트로 추가하고 `Task`/`StudySession` 서버 액션에 연결.
