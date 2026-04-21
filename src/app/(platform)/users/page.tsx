import { LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getPermissionLabels, hasPermission } from "@/config/permissions";
import {
  createUserAction,
  updateUserAction
} from "@/features/users/actions";
import { requireCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getUserManagementData } from "@/services/platform";

type UserManagementData = Awaited<ReturnType<typeof getUserManagementData>>;
type DirectoryUser = UserManagementData["users"][number];
type RoleOption = UserManagementData["roles"][number];
type UnitOption = UserManagementData["units"][number];

type UsersPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const statusOptions = [
  { value: "ACTIVE", label: "نشط" },
  { value: "INACTIVE", label: "غير نشط" },
  { value: "SUSPENDED", label: "موقوف" }
] as const;

function getStatusLabel(status: string) {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
}

function getStatusTone(status: string): "success" | "danger" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "danger";

  return "warning";
}

function getPageMessage(searchParams: Awaited<UsersPageProps["searchParams"]>) {
  if (searchParams.success === "created") {
    return {
      tone: "success",
      title: "تم إنشاء المستخدم",
      description: "أضيف الحساب الجديد وأصبح جاهزًا للدخول وفق الدور المحدد."
    };
  }

  if (searchParams.success === "updated") {
    return {
      tone: "success",
      title: "تم تحديث المستخدم",
      description: "تم حفظ بيانات الحساب وتحديث الدور أو كلمة المرور عند الحاجة."
    };
  }

  const errors: Record<string, string> = {
    forbidden: "ليست لديك صلاحية إدارة المستخدمين.",
    validation: "يرجى مراجعة الحقول المطلوبة وصيغة اسم المستخدم والبريد.",
    username_exists: "اسم المستخدم موجود مسبقًا. اختر اسمًا آخر.",
    email_exists: "البريد الإلكتروني مستخدم في حساب آخر.",
    save_failed: "تعذر حفظ بيانات المستخدم. حاول مرة أخرى.",
    role_not_found: "الدور المحدد غير متاح.",
    admin_role_restricted: "تعيين دور مسؤول النظام محصور بمن يملك صلاحيات كاملة.",
    user_not_found: "المستخدم المطلوب غير موجود.",
    self_status: "لا يمكن إيقاف أو تعطيل الحساب الذي تستخدمه حاليًا.",
    self_role: "لا يمكن تغيير دور حسابك الحالي أثناء الجلسة."
  };

  if (searchParams.error && errors[searchParams.error]) {
    return {
      tone: "danger",
      title: "لم يتم تنفيذ العملية",
      description: errors[searchParams.error]
    };
  }

  return null;
}

function permissionCount(permissions: unknown) {
  return getPermissionLabels(permissions).length;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const [currentUser, params, data] = await Promise.all([
    requireCurrentUser(),
    searchParams,
    getUserManagementData()
  ]);
  const canManageUsers = hasPermission(currentUser, "users.manage");
  const canAssignSystemAdmin = hasPermission(currentUser, "*");
  const message = getPageMessage(params);
  const assignableRoles = data.roles.filter(
    (role) => role.code !== "SYSTEM_ADMIN" || canAssignSystemAdmin
  );

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المستخدمون والصلاحيات"
        description="إدارة حسابات الدخول وتحديد الدور المؤسسي والوحدة التنظيمية وحالة الحساب وفق قواعد الصلاحيات."
      />

      {message ? (
        <div
          className={
            message.tone === "success"
              ? "rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              : "rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-rose-800"
          }
        >
          <p className="font-bold">{message.title}</p>
          <p className="mt-1 text-sm leading-7">{message.description}</p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="إجمالي المستخدمين"
          value={String(data.users.length)}
          description="حسابات معرفة في قاعدة البيانات"
        />
        <SummaryTile
          label="الحسابات النشطة"
          value={String(data.users.filter((user) => user.status === "ACTIVE").length)}
          description="مسموح لها بالدخول حاليًا"
        />
        <SummaryTile
          label="الأدوار المؤسسية"
          value={String(data.roles.length)}
          description="كل دور يحمل مجموعة صلاحيات"
        />
      </section>

      {!canManageUsers ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-8 text-amber-900">
          يمكنك استعراض دليل المستخدمين فقط. إضافة أو تعديل الحسابات يتطلب صلاحية
          <code className="mx-1 rounded bg-white px-2 py-1">users.manage</code>
          والممنوحة حاليًا لمسؤول النظام في بيئة العرض.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="space-y-6">
          {canManageUsers ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>إضافة مستخدم جديد</CardTitle>
                    <p className="section-subtitle">
                      الدور المختار يحدد صلاحيات المستخدم تلقائيًا.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UserCreateForm
                  roles={assignableRoles}
                  units={data.units}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-dashboard-ink">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>قواعد الصلاحيات</CardTitle>
                  <p className="section-subtitle">
                    الصلاحيات مرتبطة بالدور وليس بالمستخدم مباشرة.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-border/70 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-dashboard-ink">{role.nameAr}</p>
                      <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                        {role.code}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {permissionCount(role.permissions)} صلاحية
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getPermissionLabels(role.permissions)
                      .slice(0, 5)
                      .map((permission) => (
                        <Badge key={permission} variant="neutral">
                          {permission}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-panel">
            <div>
              <p className="text-sm font-semibold text-primary">دليل الحسابات</p>
              <h2 className="mt-1 text-2xl font-black text-dashboard-ink">
                المستخدمون المسجلون في النظام
              </h2>
            </div>
            <Badge variant={canManageUsers ? "success" : "warning"}>
              {canManageUsers ? "إدارة مفعلة" : "استعراض فقط"}
            </Badge>
          </div>

          <div className="grid gap-5">
            {data.users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                roles={assignableRoles}
                units={data.units}
                canManageUsers={canManageUsers}
                isCurrentUser={user.id === currentUser.id}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-white/90 p-5 shadow-panel">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black text-dashboard-ink">{value}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function UserCreateForm({
  roles,
  units
}: {
  roles: RoleOption[];
  units: UnitOption[];
}) {
  return (
    <form action={createUserAction} className="grid gap-4">
      <Input name="fullNameAr" placeholder="الاسم الرباعي بالعربية" required />
      <Input name="titleAr" placeholder="المسمى الوظيفي" />
      <Input name="username" dir="ltr" placeholder="username" required />
      <Input name="email" type="email" dir="ltr" placeholder="user@mofa.ye" required />
      <Input name="phone" dir="ltr" placeholder="+967..." />
      <Input
        name="password"
        type="password"
        dir="ltr"
        placeholder="كلمة مرور مؤقتة"
        required
      />
      <Select name="roleId" defaultValue="" required>
        <option value="">اختر الدور والصلاحيات</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.nameAr} - {permissionCount(role.permissions)} صلاحية
          </option>
        ))}
      </Select>
      <Select name="organizationalUnitId" defaultValue="">
        <option value="">بدون وحدة تنظيمية</option>
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.nameAr}
          </option>
        ))}
      </Select>
      <Select name="status" defaultValue="ACTIVE">
        {statusOptions.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>
      <Button type="submit" className="w-full">
        إنشاء المستخدم
      </Button>
    </form>
  );
}

function UserCard({
  user,
  roles,
  units,
  canManageUsers,
  isCurrentUser
}: {
  user: DirectoryUser;
  roles: RoleOption[];
  units: UnitOption[];
  canManageUsers: boolean;
  isCurrentUser: boolean;
}) {
  const rolePermissionLabels = getPermissionLabels(user.role.permissions);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge>{user.role.nameAr}</Badge>
              <Badge variant="outline">
                {user.organizationalUnit?.nameAr ?? "غير محددة"}
              </Badge>
              <Badge variant={getStatusTone(user.status)}>
                {getStatusLabel(user.status)}
              </Badge>
              {isCurrentUser ? <Badge variant="warning">حسابك الحالي</Badge> : null}
            </div>
            <h3 className="mt-3 text-2xl font-black text-dashboard-ink">
              {user.fullNameAr}
            </h3>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              {user.titleAr ?? "بدون مسمى وظيفي"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-muted-foreground">
            <p>
              المستخدم:{" "}
              <code dir="ltr" className="font-semibold text-dashboard-ink">
                {user.username ?? "غير محدد"}
              </code>
            </p>
            <p>البريد: {user.email}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground md:grid-cols-3">
          <p>
            آخر دخول:{" "}
            {user.lastLoginAt ? formatDate(user.lastLoginAt) : "لا يوجد تسجيل سابق"}
          </p>
          <p>
            تحديث كلمة المرور:{" "}
            {user.passwordUpdatedAt ? formatDate(user.passwordUpdatedAt) : "غير محدد"}
          </p>
          <p>محاولات فاشلة: {user.failedLoginCount}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {rolePermissionLabels.slice(0, 8).map((permission) => (
            <Badge key={permission} variant="neutral">
              {permission}
            </Badge>
          ))}
        </div>

        {canManageUsers ? (
          <form
            action={updateUserAction}
            className="grid gap-4 rounded-[24px] border border-border/70 bg-white p-4"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div className="flex items-center gap-2 text-sm font-bold text-dashboard-ink">
              <LockKeyhole className="h-4 w-4 text-primary" />
              تعديل بيانات الحساب
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                name="fullNameAr"
                defaultValue={user.fullNameAr}
                placeholder="الاسم بالعربية"
                required
              />
              <Input
                name="titleAr"
                defaultValue={user.titleAr ?? ""}
                placeholder="المسمى الوظيفي"
              />
              <Input
                name="username"
                dir="ltr"
                defaultValue={user.username ?? ""}
                placeholder="username"
                required
              />
              <Input
                name="email"
                type="email"
                dir="ltr"
                defaultValue={user.email}
                placeholder="email"
                required
              />
              <Input
                name="phone"
                dir="ltr"
                defaultValue={user.phone ?? ""}
                placeholder="الهاتف"
              />
              <Input
                name="password"
                type="password"
                dir="ltr"
                placeholder="اتركه فارغًا للإبقاء على كلمة المرور"
              />
              <Select
                name="roleId"
                defaultValue={user.role.id}
                disabled={isCurrentUser}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nameAr} - {permissionCount(role.permissions)} صلاحية
                  </option>
                ))}
              </Select>
              {isCurrentUser ? (
                <input type="hidden" name="roleId" value={user.role.id} />
              ) : null}
              <Select
                name="organizationalUnitId"
                defaultValue={user.organizationalUnit?.id ?? ""}
              >
                <option value="">بدون وحدة تنظيمية</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nameAr}
                  </option>
                ))}
              </Select>
              <Select
                name="status"
                defaultValue={user.status}
                disabled={isCurrentUser}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
              {isCurrentUser ? (
                <input type="hidden" name="status" value={user.status} />
              ) : null}
            </div>
            <Button type="submit" className="justify-self-start">
              حفظ التعديلات
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
