import type { Route } from "next";
import Link from "next/link";
import { LogOut, Shield } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/features/auth/actions";
import { formatDate } from "@/lib/utils";

type AppShellProps = {
  user: {
    fullNameAr: string;
    titleAr: string | null;
    role: {
      nameAr: string;
    };
    organizationalUnit: {
      nameAr: string;
    } | null;
  };
  pendingApprovalsCount: number;
  notifications: Array<{
    id: string;
    titleAr: string;
    messageAr: string;
    link: string | null;
    createdAt: Date;
  }>;
  children: React.ReactNode;
};

export function AppShell({
  user,
  pendingApprovalsCount,
  notifications,
  children
}: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-6 xl:flex-row-reverse">
        <aside className="w-full shrink-0 xl:w-[300px]">
          <div className="surface-grid sticky top-4 rounded-[32px] border border-white/80 bg-[#eef3f0]/90 p-5 shadow-soft backdrop-blur">
            <div className="mb-6 rounded-[24px] bg-white/80 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
                {siteConfig.shortName}
              </p>
              <h2 className="mt-3 text-xl font-bold text-dashboard-ink">
                {siteConfig.name}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {siteConfig.owner}
              </p>
            </div>

            <SidebarNav notificationCount={pendingApprovalsCount} />

            <div className="mt-6 space-y-3 rounded-[24px] bg-white/80 p-4">
              <p className="text-sm font-semibold text-dashboard-ink">
                المستخدم الحالي
              </p>
              <div className="rounded-2xl border border-border/70 p-4">
                <p className="font-bold text-dashboard-ink">{user.fullNameAr}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.titleAr}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{user.role.nameAr}</Badge>
                  {user.organizationalUnit ? (
                    <Badge variant="outline">{user.organizationalUnit.nameAr}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                بيئة عرض تنفيذية باللغة العربية مع دعم RTL كامل
              </div>
              <h1 className="text-2xl font-bold text-dashboard-ink">
                مرحبًا، {user.fullNameAr}
              </h1>
              <p className="text-sm leading-7 text-muted-foreground">
                {user.organizationalUnit?.nameAr ?? "الإدارة العامة"} • آخر تحديث للوحة
                {` ${formatDate(new Date())}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary">
                <Link href="/approvals">قائمة الاعتمادات</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline">
                  <LogOut className="me-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </form>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">{children}</div>
            <div className="space-y-6">
              <div className="panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="section-title">التنبيهات والإشعارات</h3>
                    <p className="section-subtitle">
                      آخر الإشعارات الخاصة بالمستخدم الحالي
                    </p>
                  </div>
                  <Badge variant="warning">{notifications.length}</Badge>
                </div>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={(notification.link ?? "/dashboard") as Route}
                      className="block rounded-2xl border border-border/70 bg-slate-50 p-4 transition hover:bg-white"
                    >
                      <p className="font-semibold text-dashboard-ink">
                        {notification.titleAr}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {notification.messageAr}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
