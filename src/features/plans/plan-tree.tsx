import { Link2, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getStatusMeta } from "@/config/status";
import {
  deletePlanNodeAction,
  linkKpiToNodeAction,
  updatePlanNodeAction
} from "@/features/plans/actions";

type UserOption = { id: string; fullNameAr: string };
type KpiOption = { id: string; titleAr: string };

type PlanTreeNode = {
  id: string;
  titleAr: string;
  description: string | null;
  status: string;
  sortOrder: number;
  progressPercent: number;
  ownerId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  templateLevel: { nameAr: string };
  owner: { fullNameAr: string } | null;
  kpiLinks: Array<{ id: string; kpi: { titleAr: string } }>;
  children: PlanTreeNode[];
};

type PlanTreeProps = {
  planId: string;
  nodes: PlanTreeNode[];
  users: UserOption[];
  kpis: KpiOption[];
};

function NodeCard({
  planId,
  node,
  users,
  kpis,
  depth = 0
}: {
  planId: string;
  node: PlanTreeNode;
  users: UserOption[];
  kpis: KpiOption[];
  depth?: number;
}) {
  const meta = getStatusMeta(node.status);

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl border border-border/70 bg-white p-4"
        style={{ marginInlineStart: `${depth * 12}px` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-dashboard-ink">{node.titleAr}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {node.templateLevel.nameAr}
              {node.owner ? ` • ${node.owner.fullNameAr}` : ""}
            </p>
          </div>
          <StatusBadge label={meta.label} tone={meta.tone} />
        </div>

        <div className="mt-3">
          <Progress value={node.progressPercent} />
          <p className="mt-2 text-sm text-muted-foreground">
            نسبة التقدم الحالية: {node.progressPercent}%
          </p>
        </div>

        {node.kpiLinks.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {node.kpiLinks.map((link) => (
              <span key={link.id} className="metric-chip">
                {link.kpi.titleAr}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <form action={updatePlanNodeAction} className="grid gap-3">
            <input type="hidden" name="nodeId" value={node.id} />
            <input type="hidden" name="planId" value={planId} />
            <input
              name="titleAr"
              defaultValue={node.titleAr}
              className="h-11 rounded-xl border border-input px-3 text-sm"
            />
            <textarea
              name="description"
              defaultValue={node.description ?? ""}
              className="min-h-[90px] rounded-xl border border-input px-3 py-2 text-sm"
            />
            <div className="grid gap-3 md:grid-cols-4">
              <select
                name="status"
                defaultValue={node.status}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              >
                <option value="DRAFT">مسودة</option>
                <option value="ACTIVE">نشط</option>
                <option value="AT_RISK">متعثر</option>
                <option value="COMPLETED">مكتمل</option>
                <option value="ON_HOLD">معلق</option>
              </select>
              <select
                name="ownerId"
                defaultValue={node.ownerId ?? ""}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              >
                <option value="">بدون تعيين</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullNameAr}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="progressPercent"
                min={0}
                max={100}
                defaultValue={node.progressPercent}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              />
              <input
                type="number"
                name="sortOrder"
                min={1}
                defaultValue={node.sortOrder}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                name="startDate"
                defaultValue={node.startDate?.toISOString().slice(0, 10) ?? ""}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              />
              <input
                type="date"
                name="endDate"
                defaultValue={node.endDate?.toISOString().slice(0, 10) ?? ""}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              />
            </div>
            <Button type="submit" size="sm">
              حفظ العقدة
            </Button>
          </form>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <form action={linkKpiToNodeAction} className="grid gap-2">
              <input type="hidden" name="planNodeId" value={node.id} />
              <input type="hidden" name="planId" value={planId} />
              <label className="text-sm font-medium text-dashboard-ink">
                ربط مؤشر أداء
              </label>
              <select
                name="kpiId"
                className="h-11 rounded-xl border border-input bg-white px-3 text-sm"
                defaultValue=""
              >
                <option value="">اختر مؤشرًا</option>
                {kpis.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.titleAr}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="secondary">
                <Link2 className="me-2 h-4 w-4" />
                ربط
              </Button>
            </form>

            {node.children.length === 0 ? (
              <form action={deletePlanNodeAction}>
                <input type="hidden" name="nodeId" value={node.id} />
                <input type="hidden" name="planId" value={planId} />
                <Button type="submit" size="sm" variant="destructive" className="w-full">
                  <Trash2 className="me-2 h-4 w-4" />
                  حذف العقدة
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {node.children.map((child) => (
        <NodeCard
          key={child.id}
          planId={planId}
          node={child}
          users={users}
          kpis={kpis}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function PlanTree({ planId, nodes, users, kpis }: PlanTreeProps) {
  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          planId={planId}
          node={node}
          users={users}
          kpis={kpis}
        />
      ))}
    </div>
  );
}
