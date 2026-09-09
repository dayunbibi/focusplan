# FocusPlan

시간표, 캘린더, 할 일, 과제, 시험, 공부 계획을 한곳에서 관리하는 학생용 생산성 웹앱 MVP입니다.
귀여운 느낌과 핑크색의 느낌이 포인트입니다. 

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL, Prisma 7
- Lucide 아이콘

## 시작하기

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

로컬 PostgreSQL에 맞게 `.env`의 `DATABASE_URL`을 수정한 다음, 최초 마이그레이션을 생성합니다.

```bash
npm run db:migrate -- --name init
```

## 주요 명령어

```bash
npm run typecheck
npm run lint
npm run build
npm run db:studio
```

## 구조

```text
src/
├── app/
│   ├── (app)/
│   │   ├── _components/     # 앱 셸과 재사용 UI
│   │   ├── _lib/            # 화면용 데이터 계층
│   │   ├── calendar/
│   │   ├── settings/
│   │   ├── study-planner/
│   │   ├── tasks/
│   │   ├── timetable/
│   │   └── page.tsx         # Dashboard
│   ├── globals.css
│   └── layout.tsx
├── generated/prisma/        # prisma generate 결과 (git 제외)
└── types/                   # 화면 및 도메인 타입
prisma/
└── schema.prisma            # PostgreSQL 데이터 모델
```

현재 Dashboard는 타입이 지정된 목업 데이터를 사용합니다. `_lib/dashboard-data.ts`의 데이터 접근부를 Prisma 쿼리로 교체할 수 있도록 UI 컴포넌트와 분리되어 있습니다. `StudySession.source`는 향후 AI 자동 계획과 수동 계획을 구분하기 위한 최소 확장 지점입니다.
