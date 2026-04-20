import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getKnowledgeDocuments } from "@/services/platform";

type KnowledgeDocumentListItem = Awaited<ReturnType<typeof getKnowledgeDocuments>>[number];

export default async function KnowledgePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const documents = await getKnowledgeDocuments(q);

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المعرفة والبحوث"
        description="مكتبة وثائق مؤسسية قابلة للبحث، مع الربط بالخطط والتقارير والبرامج التدريبية."
      />

      <form className="panel p-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="ابحث في الوثائق أو الوسوم..."
          className="h-11 w-full rounded-xl border border-input px-3 text-sm"
        />
      </form>

      <div className="grid gap-5 xl:grid-cols-2">
        {documents.map((document: KnowledgeDocumentListItem) => (
          <Link key={document.id} href={`/knowledge/${document.id}`}>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-xl font-bold">{document.titleAr}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {document.documentType}
                  </p>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  {document.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag: string) => (
                    <span key={tag} className="metric-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
