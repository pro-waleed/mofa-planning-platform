import { PageHeader } from "@/components/page-header";
import { PlanForm } from "@/features/plans/plan-form";
import { prisma } from "@/lib/prisma";

export default async function NewPlanPage() {
  const [templates, users, units] = await Promise.all([
    prisma.template.findMany({
      where: { status: { in: ["ACTIVE", "DRAFT"] } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        fullNameAr: true
      },
      orderBy: { fullNameAr: "asc" }
    }),
    prisma.organizationalUnit.findMany({
      orderBy: { nameAr: "asc" }
    })
  ]);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="إنشاء خطة من قالب"
        description="اختر القالب المناسب ثم أنشئ خطة جديدة قابلة للبناء الهرمي وربط الملكية والمؤشرات والاعتمادات."
        backHref="/plans"
      />
      <PlanForm templates={templates} users={users} units={units} />
    </div>
  );
}
