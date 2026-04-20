param(
  [switch]$UseDockerPostgres
)

$ErrorActionPreference = "Stop"

Write-Host "Preparing MOFA Planning Platform local environment..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example" -ForegroundColor Green
} else {
  Write-Host ".env already exists, keeping current values" -ForegroundColor Yellow
}

if ($UseDockerPostgres) {
  Write-Host "Starting local PostgreSQL container..." -ForegroundColor Cyan
  docker compose up -d postgres
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Update DATABASE_URL and DIRECT_URL inside .env"
Write-Host "2. Run: npm run prisma:push"
Write-Host "3. Run: npm run db:seed"
Write-Host "4. Run: npm run dev"
