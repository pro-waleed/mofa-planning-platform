import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStatusMeta } from "@/config/status";
import { getInitiatives } from "@/services/platform";

type InitiativeListItem = Awaited<ReturnType<typeof getInitiatives>>[number];

export default async function InitiativesPage() {
  const initiatives = await getInitiatives();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="المبادرات والإجراءات"
        description="متابعة عناصر التنفيذ المرتبطة بالعقد التخطيطية، بما في ذلك التقدم والعوائق والإجراءات التصحيحية."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {initiatives.map((initiative: InitiativeListItem) => {
          const meta = getStatusMeta(initiative.status);

          return (
            <Link key={initiative.id} href={`/initiatives/${initiative.id}`}>
              <Card className="h-full">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">{initiative.titleAr}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {initiative.plan.titleAr}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <Progress value={initiative.progressPercent} />
                  <p className="text-sm text-muted-foreground">
                    المالك: {initiative.owner.fullNameAr}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
