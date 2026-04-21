import { CalendarRange, Link2, Trash2, Users2 } from "lucide-react";

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

export type PlanTreeNode = {
  id: string;
  titleAr: string;
  description: string | null;
  status: string;
  sortOrder: number;
  progressPercent: number;
  ownerId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  templateLevel: { nameAr: string; levelOrder: number };
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

function formatShortDate(value: Date | null) {
  if (!value) return "غير محدد";

  return new Intl.DateTimeFormat("ar-YE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(value);
}

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
    <div className="space-y-4">
      <div
        className="relative rounded-[28px] border border-border/70 bg-white p-5 shadow-panel"
        style={{ marginInlineStart: `${depth * 20}px` }}
      >
        {depth > 0 ? (
          <div className="absolute -start-4 top-10 h-[calc(100%-2.5rem)] w-4 border-s-2 border-dashed border-primary/20" />
        ) : null}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="metric-chip">{node.templateLevel.nameAr}</span>
              <BadgeLike>{`الترتيب ${node.sortOrder}`}</BadgeLike>
              <BadgeLike>{`${node.children.length} عقد فرعية`}</BadgeLike>
            </div>
            <div>
              <h3 className="text-xl font-bold text-dashboard-ink">{node.titleAr}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                {node.description ?? "لا يوجد وصف تفصيلي لهذه العقدة حتى الآن."}
              </p>
            </div>
          </div>
          <StatusBadge label={meta.label} tone={meta.tone} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <InfoPill
            icon={<Users2 className="h-4 w-4" />}
            label="المالك"
            value={node.owner?.fullNameAr ?? "بدون تعيين"}
          />
          <InfoPill
            icon={<CalendarRange className="h-4 w-4" />}
            label="المدة"
            value={`${formatShortDate(node.startDate)} - ${formatShortDate(node.endDate)}`}
          />
          <InfoPill
            icon={<Link2 className="h-4 w-4" />}
            label="المؤشرات المرتبطة"
            value={String(node.kpiLinks.length)}
          />
        </div>

        <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-dashboard-ink">نسبة التقدم الحالية</p>
            <p className="text-sm font-semibold text-primary">{node.progressPercent}%</p>
          </div>
          <Progress value={node.progressPercent} />
        </div>

        {node.kpiLinks.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {node.kpiLinks.map((link) => (
              <span key={link.id} className="metric-chip">
                {link.kpi.titleAr}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <form action={updatePlanNodeAction} className="grid gap-3">
            <input type="hidden" name="nodeId" value={node.id} />
            <input type="hidden" name="planId" value={planId} />
            <div className="grid gap-2">
              <label className="text-sm font-medium">عنوان العقدة</label>
              <input
                name="titleAr"
                defaultValue={node.titleAr}
                className="h-11 rounded-xl border border-input px-3 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">الوصف</label>
              <textarea
                name="description"
                defaultValue={node.description ?? ""}
                className="min-h-[90px] rounded-xl border border-input px-3 py-2 text-sm"
              />
            </div>
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
            <Button type="submit" size="sm" className="justify-self-start">
              حفظ تحديثات العقدة
            </Button>
          </form>

          <div className="space-y-3 rounded-[24px] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-dashboard-ink">ربط مؤشرات الأداء</p>
            <form action={linkKpiToNodeAction} className="grid gap-2">
              <input type="hidden" name="planNodeId" value={node.id} />
              <input type="hidden" name="planId" value={planId} />
              <select
                name="kpiId"
                className="h-11 rounded-xl border border-input bg-white px-3 text-sm"
                defaultValue=""
              >
                <option value="">اختر مؤشرًا للربط</option>
                {kpis.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.titleAr}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="secondary">
                <Link2 className="me-2 h-4 w-4" />
                ربط المؤشر
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
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-white p-3 text-sm leading-7 text-muted-foreground">
                لا يمكن حذف العقدة ما دامت تحتوي على عناصر فرعية مرتبطة بها.
              </div>
            )}
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

function BadgeLike({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function InfoPill({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-semibold text-dashboard-ink">{value}</p>
    </div>
  );
}

export function PlanTree({ planId, nodes, users, kpis }: PlanTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border p-6 text-sm leading-8 text-muted-foreground">
        لم تُبنَ شجرة الخطة بعد. ابدأ بإضافة العقدة الأولى من المستوى الأعلى، وسيقوم
        النظام بتوجيهك تلقائيًا إلى المستوى التالي وفق ترتيب القالب.
      </div>
    );
  }

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
