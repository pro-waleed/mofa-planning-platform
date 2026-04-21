# 02 System Architecture

## Architecture Summary

The MVP uses a full-stack Next.js architecture with server-rendered App Router pages, server actions for write operations, Prisma as the persistence layer, and PostgreSQL on Neon as the target production database.

## Runtime Stack

- Frontend: Next.js App Router, React 19, Tailwind CSS
- Backend: Next.js server components, route-level rendering, server actions
- ORM: Prisma
- Database: PostgreSQL
- Charts: Recharts
- Validation: Zod and React Hook Form
- Deployment target: Vercel

## High-Level Layers

### Presentation Layer

Located primarily in:

- `src/app`
- `src/components`
- `src/features/*/*.tsx`

Responsibilities:

- Arabic RTL rendering
- layout shell and navigation
- dashboard composition
- forms and institutional views
- empty, loading, and approval states

### Application Layer

Located primarily in:

- `src/features/*/actions.ts`
- `src/services/platform.ts`

Responsibilities:

- module-specific write actions
- page data aggregation
- workflow transitions
- feature-level orchestration

### Domain And Validation Layer

Located primarily in:

- `src/features/*/schema.ts`
- `src/config`
- `src/lib`

Responsibilities:

- Zod validation
- status mapping
- auth/session helpers
- common utilities and formatting

### Persistence Layer

Located in:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations`

Responsibilities:

- institutional data model
- relationships and status enums
- seeding stakeholder-grade demo data
- migration tracking

## Request And Render Flow

Typical read flow:

1. App Router page loads on the server.
2. `requireCurrentUser()` validates the signed session cookie and resolves the active user role context.
3. Page calls aggregators from `src/services/platform.ts`.
4. Prisma queries read the relevant institutional entities.
5. Server components render an RTL page with Arabic content.

Typical write flow:

1. User submits a form built with React Hook Form or native form controls.
2. A server action validates input with Zod or form parsing.
3. Prisma writes the change into PostgreSQL.
4. Relevant paths are revalidated.
5. Updated server-rendered pages reflect the new workflow state.

## Dynamic Planning Architecture

The planning engine is intentionally template-driven.

Instead of hardcoding a specific hierarchy, the architecture separates:

- `Template`: the overall planning blueprint
- `TemplateLevel`: the ordered structural layers
- `TemplateField`: configurable fields attached to each level
- `Plan`: an instantiated plan from a template
- `PlanNode`: hierarchical nodes created under a plan

This allows the same application to support multiple planning methodologies without rewriting the planning module.

## Deployment Topology

### Local

- Next.js app runs through `npm run dev`
- PostgreSQL runs either locally or in Docker
- Prisma connects through `.env`

### Cloud

- GitHub stores the repository and CI entry point
- Neon hosts PostgreSQL
- Vercel hosts the Next.js application

## Security And Authentication Notes

The current MVP uses a seeded credential login flow for stakeholder walkthroughs:

- each seeded user has a unique username
- demo passwords are stored as salted `scrypt` hashes
- the session cookie is HTTP-only and signed with `DEMO_SESSION_SECRET`
- roles include a JSON permission list for the next RBAC phase

For production, replace this with:

- enterprise authentication or SSO
- secure session management
- route-level authorization
- audit-grade access controls

## Architectural Tradeoffs

- The MVP favors delivery speed and demo readiness over a full RBAC engine
- Server actions reduce API surface area for internal module writes
- Shared service aggregation keeps pages clean and readable
- Dynamic templates are implemented for levels first, with field extensibility already present in the schema for future expansion
