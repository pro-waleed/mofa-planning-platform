# MOFA Planning Platform

Arabic-first institutional planning and research platform for the General Directorate of Planning and Research at the Ministry of Foreign Affairs and Expatriates of the Republic of Yemen.

## Overview

This repository contains a stakeholder-ready MVP for an institutional platform that brings together dynamic planning, KPI management, monitoring and evaluation, mission reporting, training and capacity building, approvals, knowledge management, and executive dashboards in one coherent Arabic RTL experience.

The product is intentionally built around a dynamic planning engine rather than a fixed strategic-plan hierarchy. Templates define levels and fields, which allows the platform to support structures such as:

- `Priority > Strategic Goal > Sub Goal > Initiative > KPI`
- `Axis > Program > Project > Activity > Output > Indicator`
- `Objective > Result > Action > Measure`

## Business Purpose

The platform helps the directorate standardize planning and reporting workflows across headquarters and missions, improve follow-up on execution, reduce fragmented spreadsheets, and give leadership a single executive view of institutional performance.

## Core Modules

- Executive dashboard with approvals, alerts, KPI health, training summary, and recent activity
- Dynamic template engine with configurable levels and fields
- Planning workspace with tree-based plan node editing
- Initiative and action tracking with blockers and corrective actions
- KPI registry with baseline, target, actuals, thresholds, and ownership
- Monitoring and evaluation cycles with progress updates and review states
- Mission reporting with return-for-completion workflow and comment history
- Training and capacity building with nomination and manager approval flow
- Knowledge and research library with metadata and cross-module links
- Workflow approvals queue across plans, reports, monitoring cycles, training, and templates
- Notifications and institutional activity history
- Demo authentication and role context for stakeholder walkthroughs

## Screenshots

Add product screenshots or animated captures here before stakeholder distribution:

- `docs/screenshots/dashboard-overview.png`
- `docs/screenshots/template-engine.png`
- `docs/screenshots/plan-tree-editor.png`
- `docs/screenshots/report-review-flow.png`

## Technology Stack

- Next.js 15 App Router
- TypeScript with strict mode
- Tailwind CSS
- Reusable UI primitives inspired by shadcn/ui patterns
- Prisma ORM
- PostgreSQL on Neon
- Zod and React Hook Form
- Recharts
- Lucide React
- Docker and Docker Compose
- Vercel deployment target

## Repository Structure

```text
src/
  app/
  components/
  config/
  features/
  hooks/
  lib/
  services/
  styles/
  types/
prisma/
  migrations/
docs/
public/
scripts/
tests/
```

## Implemented Routes

- `/login`
- `/dashboard`
- `/templates`
- `/templates/new`
- `/templates/[id]`
- `/plans`
- `/plans/new`
- `/plans/[id]`
- `/initiatives`
- `/initiatives/[id]`
- `/kpis`
- `/kpis/[id]`
- `/monitoring`
- `/monitoring/[id]`
- `/reports`
- `/reports/new`
- `/reports/[id]`
- `/training`
- `/training/new`
- `/training/[id]`
- `/knowledge`
- `/knowledge/[id]`
- `/approvals`
- `/users`
- `/settings`

## Local Setup

### Prerequisites

- Node.js 20.9+ or 22+
- npm 10+
- PostgreSQL or a Neon database

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

### 3. Configure database connection

Set `DATABASE_URL` in `.env` to either a local PostgreSQL database or a Neon pooled connection string.

If you are using migrations from your workstation, also set `DIRECT_URL` to the direct Neon connection string.

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Apply schema

Preferred if you want tracked migrations:

```bash
npm run prisma:migrate:dev -- --name init
```

For a quick local demo environment:

```bash
npm run prisma:push
```

### 6. Seed demo data

```bash
npm run db:seed
```

### 7. Start the app

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Demo Access

The MVP now uses a credential-based demo login rather than one-click user switching. Seeded users have a unique username, hashed password, role, organizational unit, and permission set. Open `/login` and use one of these stakeholder demo accounts:

| Scenario | Username | Password |
| --- | --- | --- |
| Director General dashboard and approvals | `dg` | `Dg@2026` |
| System administration and permissions | `admin` | `Admin@2026` |
| Planning manager workflow review | `plan.manager` | `Manager@2026` |
| Planning analyst plan/tree editing | `planner1` | `Planner@2026` |
| Monitoring officer cycle updates | `monitor1` | `Monitor@2026` |
| Training officer nomination flow | `training1` | `Training@2026` |
| Mission report user | `riyadh1` | `Mission@2026` |
| Read-only reviewer | `reader` | `Reader@2026` |

These credentials are for demo use only. Production should replace this with SSO or an enterprise identity provider.

## Neon Setup

### 1. Create a Neon project

Create a PostgreSQL project and copy:

- the pooled connection string for app runtime into `DATABASE_URL`
- the direct connection string into `DIRECT_URL`

### 2. Ensure SSL is enabled

The sample `.env.example` already uses Neon-compatible parameters:

- `sslmode=require`
- `channel_binding=require`

### 3. Run Prisma against Neon

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run db:seed
```

If you prefer not to create a new migration during initial setup, use:

```bash
npm run prisma:push
npm run db:seed
```

## Prisma Migration And Seed Workflow

This repository includes:

- `prisma/schema.prisma`
- `prisma/migrations/202604190001_init/migration.sql`
- `prisma/seed.ts`

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:dev
npm run prisma:push
npm run db:seed
npm run db:seed-auth
npm run prisma:studio
```

Use `npm run db:seed-auth` when the database already has demo data and you only need to refresh usernames, demo passwords, and role permissions without reseeding all institutional records.

## Docker Setup

Start PostgreSQL and the app together:

```bash
docker compose up --build
```

Or start only the database and run the app locally:

```bash
docker compose up -d postgres
npm run dev
```

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial mofa planning platform mvp"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import the repository into Vercel

- Create a new Vercel project
- Import the GitHub repository
- Keep the framework preset as `Next.js`

### 3. Set environment variables in Vercel

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_BASE_URL`
- `DEMO_SESSION_SECRET`

### 4. Deploy

Vercel will run the project build command from `package.json`.

### 5. Prepare database schema

Use one of these patterns:

- run `npx prisma migrate deploy` in a release or CI step
- or run `npx prisma db push` once for a demo environment

### 6. Seed demo data

Seed the database from a trusted environment before the stakeholder demo, or load equivalent production-safe fixtures.

For an existing demo database, refresh only login credentials and role permission metadata with:

```bash
npm run db:seed-auth
```

## Recommended Repository Settings

- Protect `main`
- Require pull requests for merges
- Require deployment preview checks before merging UI work
- Store production environment variables only in Vercel and Neon
- Keep seeded demo content out of production data flows

## Documentation Index

- [Product overview](./docs/01-product-overview.md)
- [System architecture](./docs/02-system-architecture.md)
- [Domain model](./docs/03-domain-model.md)
- [User roles](./docs/04-user-roles.md)
- [Modules and workflows](./docs/05-modules-and-workflows.md)
- [UI and UX guidelines](./docs/06-ui-ux-guidelines.md)
- [Neon and Vercel deployment](./docs/07-neon-and-vercel-deployment.md)
- [Roadmap](./docs/08-roadmap.md)
- [Release summary](./docs/09-release-summary.md)

## Contribution Notes

- Keep Arabic labels accurate, formal, and concise
- Preserve RTL behavior in layout and interactions
- Do not introduce fixed planning-level assumptions into the domain model
- Prefer feature-level reuse over one-off page logic
- Keep server-side data access inside `src/services` and feature actions
- Validate write operations with Zod

## Roadmap Snapshot

- Add real authentication and SSO
- Add file upload and evidence storage
- Add richer permissions matrix
- Add analytics exports and printable executive packs
- Add workflow builder and notification channels
- Add audit dashboards and institutional master data

## Next-Phase Ideas

- Multi-step template designer for fields as well as levels
- More advanced drag-and-drop plan node ordering
- KPI time-series ingestion and trend forecasting
- Mission report attachments and evidence review
- Training certificates, post-training surveys, and impact scoring
- Search facets and document versioning for knowledge management
