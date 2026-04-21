import { PrismaClient } from "@prisma/client";

import { demoAccounts } from "../src/config/demo-accounts";
import { rolePermissionDefaults } from "../src/config/permissions";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.$transaction([
    ...Object.entries(rolePermissionDefaults).map(([code, permissions]) =>
      prisma.role.updateMany({
        where: { code },
        data: { permissions: [...permissions] }
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
