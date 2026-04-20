import { z } from "zod";

export const monitoringUpdateSchema = z.object({
  cycleId: z.string().min(1),
  planNodeId: z.string().optional().default(""),
  initiativeId: z.string().optional().default(""),
  kpiId: z.string().optional().default(""),
  reportedProgress: z.coerce.number().min(0).max(100),
  obstacleText: z.string().optional().default(""),
  correctiveActionText: z.string().optional().default("")
});

export type MonitoringUpdateValues = z.input<typeof monitoringUpdateSchema>;
