import { AppShell } from "@/components/app-shell";
import { requireCurrentUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/services/platform";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PlatformLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function PlatformLayout({
  children
}: PlatformLayoutProps) {
  const user = await requireCurrentUser();
  const [notifications, pendingApprovalsCount] = await Promise.all([
    getNotificationsForUser(user.id),
    prisma.approvalRequest.count({
      where: {
        status: "PENDING"
      }
    })
  ]);

  return (
    <AppShell
      user={user}
      pendingApprovalsCount={pendingApprovalsCount}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}

