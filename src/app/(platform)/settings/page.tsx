import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettingsData } from "@/services/platform";

type SettingsData = Awaited<ReturnType<typeof getSettingsData>>;

export default async function SettingsPage() {
  const settings = await getSettingsData();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="الإعدادات"
        description="ملخص الإعدادات المرجعية الأساسية في البيئة التجريبية: الأدوار، الوحدات، والقوالب."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>الأدوار</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {settings.roles.map((role: SettingsData["roles"][number]) => (
              <div key={role.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                {role.nameAr}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>الوحدات التنظيمية</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {settings.units.map((unit: SettingsData["units"][number]) => (
              <div key={unit.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                {unit.nameAr}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>آخر القوالب تحديثًا</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {settings.templates.map((template: SettingsData["templates"][number]) => (
              <div key={template.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                {template.nameAr}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
