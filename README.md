# FocusPlan

A mobile-first student planner that keeps classes, tasks, assignments, exams, and study sessions in one place.

**Live Demo:** https://focusplan-silk.vercel.app

![FocusPlan Today screen](docs/screenshot-today.png)

## Demo Account

Click **Try demo account** on the login page, or sign in manually:

| Email | Password |
| --- | --- |
| `demo@focusplan.app` | `FocusDemo2026` |

The demo account is shared and filled with sample data (courses, a weekly timetable, tasks, assignments, exams, and study sessions). It is reset every night, so changes made by visitors don't stick around.

## Features

- **Today**: the day at a glance with today's classes, tasks, and study sessions, a progress tracker, and a focus timer for the next session
- **Timetable**: a weekly class grid with color-coded courses and multiple time slots per course
- **Calendar**: a month view that combines classes, assignment deadlines, exams, and study sessions
- **Tasks**: to-dos with priorities and due dates, filterable by course, plus assignments and exams with due-date countdowns
- **Study Planner**: plan and complete study sessions, see weekly study time per course, and auto-generate a 7-day plan that fills free slots before upcoming deadlines (rule-based)
- **Settings**: profile, timezone, course management, and light/dark theme
- **Accounts**: email and password sign-up with scrypt-hashed passwords and HTTP-only session cookies; every query is scoped to the signed-in user
- **Timezone-aware**: dates and times follow each user's IANA timezone, including DST changes
- **Installable**: PWA manifest and home-screen icons


## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL ([Neon](https://neon.tech) in production), Prisma 7
- **Validation:** Zod
- **Icons:** Lucide
- **Testing:** Node test runner via `tsx`
- **Deployment:** Vercel + Neon

## Running Locally

### Prerequisites

- Node.js 20+
- A PostgreSQL database: a local Postgres or a free Neon project

### Setup

```bash
npm install
cp .env.example .env          # then set DATABASE_URL
npm run db:migrate            # create the tables
npm run db:seed               # create the demo account and sample data
npm run dev                   # http://localhost:3000
```

`DATABASE_URL` can point to either database:

- Local: `postgresql://postgres:postgres@localhost:5432/focusplan`
- Neon: `postgresql://<user>:<password>@<host>.neon.tech/neondb?sslmode=require`

The app picks the right driver automatically: the Neon serverless driver for Neon URLs, and `node-postgres` for everything else.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (auth and timezone helpers) |
| `npm run db:migrate` | Create and apply migrations in development |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Create or reset the demo account |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Vercel + Neon)

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection string with `?sslmode=require`. Used by the app at runtime. |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection string. Used by `prisma migrate deploy`. Falls back to `DATABASE_URL` if not set. |

If the Neon database is connected through the Vercel Marketplace integration, both variables are added to the Vercel project automatically.

### Steps

1. **Neon:** create a project (or connect one from Vercel → Storage) and copy both connection strings.
2. **Vercel:** import the repository, set the environment variables above for Production, and deploy.
   - Vercel runs `npm run vercel-build`, which applies migrations with `prisma migrate deploy` before `next build`.
   - Migrations only run for Production deployments, so Preview builds never change the production database.
3. **Seed:** create the demo account once against the production database:

   ```bash
   DATABASE_URL="<neon connection string>" npm run db:seed
   ```

   Re-run it at any time to reset the demo data.

4. **Daily reset (optional):** `.github/workflows/reset-demo.yml` re-runs the seed every day at about 4 AM Toronto time and can also be started from the **Actions** tab. Add the Neon connection string as a repository secret named `DATABASE_URL`.

## Project Structure

```text
src/
├── app/
│   ├── (app)/                 # Signed-in pages
│   │   ├── _components/       # Views and reusable UI
│   │   ├── _lib/              # Queries, server actions, date helpers
│   │   ├── calendar/
│   │   ├── settings/
│   │   ├── study-planner/
│   │   ├── tasks/
│   │   ├── timetable/
│   │   └── page.tsx           # Today
│   ├── (auth)/                # Login and sign-up
│   └── layout.tsx
├── components/kitty/          # Design-system components
├── lib/
│   ├── auth/                  # Password hashing, session tokens
│   ├── dal/                   # Current user and ownership checks
│   ├── demo.ts                # Demo account constants
│   └── prisma.ts              # Prisma client and driver selection
└── generated/prisma/          # Generated by `prisma generate` (git-ignored)
prisma/
├── migrations/
├── schema.prisma
└── seed.ts                    # Demo account seed
tests/                         # Unit tests
```
