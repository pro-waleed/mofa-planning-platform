import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUsersDirectory } from "@/services/platform";

type DirectoryUser = Awaited<ReturnType<typeof getUsersDirectory>>[number];

export default async function UsersPage() {
  const users = await getUsersDirectory();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المستخدمون والصلاحيات"
        description="دليل المستخدمين مع الأدوار والوحدات الإدارية ومؤشر الإشعارات غير المقروءة."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {users.map((user: DirectoryUser) => (
          <Card key={user.id}>
            <CardContent className="space-y-3 p-6">
              <div>
                <p className="text-xl font-bold">{user.fullNameAr}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.titleAr}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{user.role.nameAr}</Badge>
                <Badge variant="outline">{user.organizationalUnit?.nameAr ?? "غير محددة"}</Badge>
                <Badge variant="warning">{user.notifications.length} غير مقروء</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
