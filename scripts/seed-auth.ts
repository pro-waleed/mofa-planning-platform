import { PrismaClient } from "@prisma/client";

import { demoAccounts } from "../src/config/demo-accounts";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const rolePermissions: Record<string, string[]> = {
  SYSTEM_ADMIN: ["*"],
  DIRECTOR_GENERAL: [
    "dashboard.read",
    "plans.approve",
    "approvals.decide",
    "reports.review",
    "kpis.read",
    "audit.read"
  ],
  DEPARTMENT_MANAGER: [
    "dashboard.read",
    "plans.review",
    "plans.submit",
    "approvals.decide",
    "reports.review",
    "training.approve"
  ],
  PLANNING_ANALYST: [
    "templates.manage",
    "plans.create",
    "plans.edit",
    "kpis.manage",
    "knowledge.manage"
  ],
  MONITORING_OFFICER: [
    "monitoring.manage",
    "monitoring.submit",
    "initiatives.update",
    "kpis.update",
    "reports.read"
  ],
  TRAINING_OFFICER: [
    "training.manage",
    "training.nominations.review",
    "knowledge.manage",
    "reports.read"
  ],
  MISSION_USER: [
    "reports.create",
    "reports.edit_own",
    "training.nominate_self",
    "knowledge.read"
  ],
  READ_ONLY: [
    "dashboard.read",
    "plans.read",
    "reports.read",
    "kpis.read",
    "knowledge.read"
  ]
};

async function main() {
  const now = new Date();

  await prisma.$transaction([
    ...Object.entries(rolePermissions).map(([code, permissions]) =>
      prisma.role.updateMany({
        where: { code },
        data: { permissions }
      })
    ),
    ...demoAccounts.map((account) =>
      prisma.user.updateMany({
        where: { id: account.userId },
        data: {
          username: account.username,
          passwordHash: hashPassword(account.password),
          passwordUpdatedAt: now,
          failedLoginCount: 0,
          lastFailedLoginAt: null
        }
      })
    )
  ]);

  console.log("Demo authentication credentials and role permissions updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
