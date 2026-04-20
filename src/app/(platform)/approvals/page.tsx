import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusMeta } from "@/config/status";
import { decideApprovalAction } from "@/features/approvals/actions";
import { getApprovals } from "@/services/platform";

type ApprovalListItem = Awaited<ReturnType<typeof getApprovals>>[number];

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <div className="space-y-6 page-shell">
      <PageHeader
        title="الاعتمادات"
        description="قائمة الاعتماد الموحدة لمراجعة الخطط، التقارير، دورات المتابعة، والترشيحات."
      />
      <div className="space-y-4">
        {approvals.map((approval: ApprovalListItem) => {
          const meta = getStatusMeta(approval.status);

          return (
            <Card key={approval.id}>
              <CardContent className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold">{approval.titleAr}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {approval.description}
                      </p>
                    </div>
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>النوع: {approval.entityType}</span>
                    <span>الطالب: {approval.requester.fullNameAr}</span>
                    <span>المكلّف: {approval.assignedTo.fullNameAr}</span>
                  </div>
                </div>
                <form action={decideApprovalAction} className="space-y-3">
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <textarea
                    name="comment"
                    defaultValue={approval.decisionComment ?? ""}
                    placeholder="تعليق القرار"
                    className="min-h-[110px] w-full rounded-xl border border-input px-3 py-2 text-sm"
                  />
                  <div className="grid gap-2 md:grid-cols-3">
                    <Button type="submit" name="decision" value="approve" variant="secondary">
                      اعتماد
                    </Button>
                    <Button type="submit" name="decision" value="return" variant="outline">
                      إعادة
                    </Button>
                    <Button type="submit" name="decision" value="reject" variant="destructive">
                      رفض
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
