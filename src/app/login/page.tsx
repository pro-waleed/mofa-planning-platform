import {
  Building2,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAccountByUserId } from "@/config/demo-accounts";
import { getPermissionLabels } from "@/config/permissions";
import { loginWithCredentials } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "required") {
    return "يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة.";
  }

  if (error === "inactive") {
    return "الحساب غير نشط أو موقوف. يرجى التواصل مع مسؤول النظام.";
  }

  if (error === "invalid") {
    return "اسم المستخدم أو كلمة المرور غير صحيحة.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE"
    },
    select: {
      id: true,
      username: true,
      fullNameAr: true,
      titleAr: true,
      role: {
        select: {
          nameAr: true,
          permissions: true
        }
      },
      organizationalUnit: {
        select: {
          nameAr: true
        }
      }
    },
    orderBy: [{ role: { nameAr: "asc" } }, { fullNameAr: "asc" }]
  });

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(12,109,98,0.16),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(207,170,87,0.16),transparent_28%),linear-gradient(135deg,#f8faf8_0%,#eef4f1_52%,#fbf8ef_100%)] px-4 py-8 text-dashboard-ink"
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/88 p-7 shadow-soft backdrop-blur md:p-9">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 right-12 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              دخول مؤسسي بصلاحيات محددة
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold tracking-[0.26em] text-primary/75">
                وزارة الخارجية وشؤون المغتربين
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.35] md:text-5xl">
                منصة التخطيط المؤسسي للإدارة العامة للتخطيط والبحوث
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                شاشة دخول عرضية أقرب للنظام الحقيقي: كل مستخدم يمتلك اسم مستخدم
                وكلمة مرور ودورًا مؤسسيًا يحدد ما يمكنه مراجعته أو اعتماده داخل
                المنصة.
              </p>
            </div>

            <form
              action={loginWithCredentials}
              className="rounded-[30px] border border-dashboard-line/70 bg-white/92 p-5 shadow-panel md:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">تسجيل الدخول</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    استخدم أحد حسابات العرض التجريبي الموضحة في اللوحة اليمنى.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <LockKeyhole className="h-6 w-6" />
                </div>
              </div>

              {errorMessage ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-7 text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <UserRound className="h-4 w-4 text-primary" />
                    اسم المستخدم
                  </span>
                  <Input
                    name="username"
                    type="text"
                    dir="ltr"
                    autoComplete="username"
                    placeholder="dg"
                    className="h-12 text-left text-base"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <KeyRound className="h-4 w-4 text-primary" />
                    كلمة المرور
                  </span>
                  <Input
                    name="password"
                    type="password"
                    dir="ltr"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 text-left text-base"
                    required
                  />
                </label>

                <Button type="submit" className="h-12 w-full text-base">
                  الدخول إلى لوحة القيادة
                </Button>
              </div>
            </form>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                "جلسة موقعة بكوكي آمن",
                "كلمات مرور مجزأة",
                "دور وصلاحيات لكل مستخدم"
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[32px] border border-white/80 bg-white/82 p-6 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  حسابات العرض التجريبي
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  اختر هوية المستخدم حسب سيناريو العرض
                </h2>
              </div>
              <Badge variant="outline">{users.length} مستخدم نشط</Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              هذه البيانات مخصصة للعرض فقط. في مرحلة الإنتاج يتم ربطها بمزود هوية
              مؤسسي أو SSO مع سياسات كلمات مرور وتفويض أدق.
            </p>
          </div>

          <div className="grid max-h-[70vh] gap-4 overflow-y-auto pe-1">
            {users.map((user) => {
              const account = demoAccountByUserId[user.id];
              const permissions = getPermissionLabels(user.role.permissions).slice(0, 4);

              return (
                <article
                  key={user.id}
                  className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-panel transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{user.role.nameAr}</Badge>
                        <Badge variant="outline">
                          {account?.audienceAr ?? "مستخدم نظام"}
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-xl font-bold">{user.fullNameAr}</h3>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        {user.titleAr}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <p className="font-semibold text-dashboard-ink">بيانات الدخول</p>
                      <div className="mt-2 space-y-1 text-muted-foreground">
                        <p>
                          المستخدم:{" "}
                          <code dir="ltr" className="font-semibold text-dashboard-ink">
                            {account?.username ?? user.username}
                          </code>
                        </p>
                        <p>
                          المرور:{" "}
                          <code dir="ltr" className="font-semibold text-dashboard-ink">
                            {account?.password ?? "محددة في seed"}
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.2fr]">
                    <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm leading-7 text-muted-foreground">
                      <span className="mb-1 flex items-center gap-2 font-semibold text-dashboard-ink">
                        <Building2 className="h-4 w-4 text-primary" />
                        الوحدة التنظيمية
                      </span>
                      {user.organizationalUnit?.nameAr ?? "غير محددة"}
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm leading-7 text-muted-foreground">
                      <span className="mb-2 block font-semibold text-dashboard-ink">
                        سيناريو مناسب للعرض
                      </span>
                      {account?.flowAr ?? "استعراض عام للصلاحيات والبيانات"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {permissions.map((permission) => (
                      <Badge key={permission} variant="neutral">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </article>
              );
            })}

            {users.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-border bg-white/80 p-6 text-sm leading-7 text-muted-foreground">
                لا توجد حسابات مفعلة بعد. شغّل أوامر Prisma seed لإضافة بيانات
                العرض التجريبي ثم أعد فتح الصفحة.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
