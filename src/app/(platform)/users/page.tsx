import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getUsersDirectory } from "@/services/platform";

type DirectoryUser = Awaited<ReturnType<typeof getUsersDirectory>>[number];

function getPermissionCount(permissions: DirectoryUser["role"]["permissions"]) {
  return Array.isArray(permissions) ? permissions.length : 0;
}

export default async function UsersPage() {
  const users = await getUsersDirectory();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المستخدمون والصلاحيات"
        description="دليل حسابات النظام مع اسم المستخدم، الدور، الوحدة التنظيمية، حالة الحساب ومؤشرات الدخول."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {users.map((user: DirectoryUser) => (
          <Card key={user.id}>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xl font-bold">{user.fullNameAr}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.titleAr}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>{user.role.nameAr}</Badge>
                <Badge variant="outline">
                  {user.organizationalUnit?.nameAr ?? "غير محددة"}
                </Badge>
                <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>
                  {user.status === "ACTIVE" ? "نشط" : "غير نشط"}
                </Badge>
                <Badge variant="warning">
                  {user.notifications.length} غير مقروء
                </Badge>
              </div>

              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  اسم المستخدم:{" "}
                  <code dir="ltr" className="font-semibold text-dashboard-ink">
                    {user.username ?? "غير محدد"}
                  </code>
                </p>
                <p>البريد: {user.email}</p>
                <p>الصلاحيات: {getPermissionCount(user.role.permissions)}</p>
                <p>
                  آخر دخول:{" "}
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : "لا يوجد تسجيل سابق"}
                </p>
              </div>

              {user.failedLoginCount > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-amber-800">
                  توجد {user.failedLoginCount} محاولة دخول غير ناجحة مسجلة لهذا
                  الحساب.
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
