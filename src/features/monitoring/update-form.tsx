"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMonitoringUpdateAction } from "@/features/monitoring/actions";
import {
  monitoringUpdateSchema,
  type MonitoringUpdateValues
} from "@/features/monitoring/schema";

type MonitoringUpdateFormProps = {
  cycleId: string;
  planNodes: Array<{ id: string; titleAr: string }>;
  initiatives: Array<{ id: string; titleAr: string }>;
  kpis: Array<{ id: string; titleAr: string }>;
};

export function MonitoringUpdateForm({
  cycleId,
  planNodes,
  initiatives,
  kpis
}: MonitoringUpdateFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<MonitoringUpdateValues>({
    resolver: zodResolver(monitoringUpdateSchema),
    defaultValues: {
      cycleId,
      planNodeId: "",
      initiativeId: "",
      kpiId: "",
      reportedProgress: 0,
      obstacleText: "",
      correctiveActionText: ""
    }
  });

  const onSubmit = (values: MonitoringUpdateValues) => {
    startTransition(async () => {
      await createMonitoringUpdateAction(cycleId, values);
      form.reset({
        cycleId,
        planNodeId: "",
        initiativeId: "",
        kpiId: "",
        reportedProgress: 0,
        obstacleText: "",
        correctiveActionText: ""
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة تحديث متابعة</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Select {...form.register("planNodeId")}>
            <option value="">اختر عقدة</option>
            {planNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.titleAr}
              </option>
            ))}
          </Select>
          <Select {...form.register("initiativeId")}>
            <option value="">اختر مبادرة</option>
            {initiatives.map((initiative) => (
              <option key={initiative.id} value={initiative.id}>
                {initiative.titleAr}
              </option>
            ))}
          </Select>
          <Select {...form.register("kpiId")}>
            <option value="">اختر مؤشرًا</option>
            {kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>
                {kpi.titleAr}
              </option>
            ))}
          </Select>
          <Input type="number" min={0} max={100} {...form.register("reportedProgress")} />
          <Textarea {...form.register("obstacleText")} placeholder="العوائق أو الملاحظات" />
          <Textarea
            {...form.register("correctiveActionText")}
            placeholder="الإجراء التصحيحي المقترح"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "جارٍ الحفظ..." : "حفظ التحديث"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

