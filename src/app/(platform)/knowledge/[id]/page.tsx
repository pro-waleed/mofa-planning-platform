import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnowledgeDocumentById } from "@/services/platform";

type KnowledgeDocumentDetail = NonNullable<
  Awaited<ReturnType<typeof getKnowledgeDocumentById>>
>;

export default async function KnowledgeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getKnowledgeDocumentById(id);

  if (!document) notFound();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title={document.titleAr} description={document.summary ?? ""} backHref="/knowledge" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>الوصف والوسوم</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-8 text-muted-foreground">{document.summary}</p>
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag: KnowledgeDocumentDetail["tags"][number]) => (
                <span key={tag} className="metric-chip">{tag}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>الارتباطات</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>الوحدة: {document.organizationalUnit?.nameAr ?? "غير محددة"}</p>
            <p>الرافع: {document.uploadedBy.fullNameAr}</p>
            <p>الخطة: {document.plan?.titleAr ?? "غير مرتبط"}</p>
            <p>التقرير: {document.missionReport?.titleAr ?? "غير مرتبط"}</p>
            <p>التدريب: {document.trainingProgram?.titleAr ?? "غير مرتبط"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
