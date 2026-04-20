import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loginAsUser } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      organizationalUnit: true
    },
    orderBy: [{ role: { nameAr: "asc" } }, { fullNameAr: "asc" }]
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,109,98,0.14),transparent_30%),linear-gradient(180deg,#f9fbfa_0%,#eef3f0_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur">
          <Badge>الدخول التجريبي</Badge>
          <h1 className="mt-4 text-3xl font-bold text-dashboard-ink md:text-4xl">
            منصة التخطيط المؤسسي للإدارة العامة للتخطيط والبحوث
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground">
            اختر دورًا تجريبيًا للدخول إلى النظام واستعراض مسارات التخطيط الديناميكي،
            المتابعة والتقييم، تقارير البعثات، التدريب، والاعتمادات.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeftCircle className="me-2 h-4 w-4" />
                العودة إلى لوحة القيادة
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user: (typeof users)[number]) => (
            <form
              key={user.id}
              action={loginAsUser}
              className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur"
            >
              <input type="hidden" name="userId" value={user.id} />
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-dashboard-ink">
                    {user.fullNameAr}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.titleAr}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{user.role.nameAr}</Badge>
                  {user.organizationalUnit ? (
                    <Badge variant="outline">{user.organizationalUnit.nameAr}</Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  {user.email}
                </p>
                <Button type="submit" className="w-full">
                  الدخول بهذا الدور
                </Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
