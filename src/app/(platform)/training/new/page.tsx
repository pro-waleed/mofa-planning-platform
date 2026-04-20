import { PageHeader } from "@/components/page-header";
import { TrainingProgramForm } from "@/features/training/training-program-form";
import { prisma } from "@/lib/prisma";

export default async function NewTrainingPage() {
  const units = await prisma.organizationalUnit.findMany({
    orderBy: { nameAr: "asc" }
  });

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="نشر فرصة تدريبية"
        description="أنشئ برنامجًا تدريبيًا جديدًا مع المقاعد والفئة المستهدفة والتواريخ."
        backHref="/training"
      />
      <TrainingProgramForm units={units} />
    </div>
  );
}

