# 07 Neon And Vercel Deployment

## Deployment Objective

Deploy the platform as a professional demo or pilot environment using:

- GitHub for source control
- Neon for PostgreSQL
- Vercel for hosting the Next.js application

## Environment Variables

Set these in local `.env` and in Vercel project settings:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_BASE_URL`
- `DEMO_SESSION_SECRET`

## Neon Setup

### 1. Create a Neon project and database

Create a database for the platform, for example:

- database name: `mofa_planning`

### 2. Copy connection strings

Use:

- pooled connection string for `DATABASE_URL`
- direct connection string for `DIRECT_URL`

The example file already uses Neon-compatible SSL parameters.

### 3. Apply the schema

For an environment using tracked migrations:

```bash
npm run prisma:migrate
```

For a quick demo environment:

```bash
npm run prisma:push
```

### 4. Seed the data

```bash
npm run db:seed
```

## GitHub Preparation

### 1. Initialize and push

```bash
git init
git add .
git commit -m "feat: initial institutional planning platform mvp"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Recommended repository settings

- enable branch protection on `main`
- require pull request review
- keep secrets out of the repository
- connect preview deployments before stakeholder review

## Vercel Setup

### 1. Import repository

Import the GitHub repository into Vercel and keep the framework detected as Next.js.

### 2. Configure environment variables

Add the environment values listed above in:

- Production
- Preview
- Development, if you use Vercel local tooling

### 3. Build and deploy

Vercel will run the build process based on `package.json`.

The current build path expects Prisma client generation during build.

### 4. Database schema in deployed environments

Recommended:

- run `npx prisma migrate deploy` as part of deployment or release workflow

Alternative for demo-only environments:

- run `npx prisma db push` one time against the target database

### 5. Verify deployment

After deployment:

- open `/login`
- confirm seeded users appear
- sign in as `مدير عام`
- review `/dashboard`
- open `/templates`, `/plans`, `/reports`, `/training`, and `/approvals`

## Suggested Release Checklist

- verify environment variables in Vercel
- verify Neon connectivity
- apply schema
- seed demo data
- confirm Arabic RTL rendering in the browser
- confirm dashboard charts and seeded records load correctly
- confirm workflow actions update records
