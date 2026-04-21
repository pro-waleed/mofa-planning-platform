import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "success" | "danger";
};

const toneClasses = {
  primary: "bg-primary/10 text-primary ring-1 ring-primary/10",
  warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  danger: "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary"
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-white/80 bg-white/90">
      <CardContent className="relative flex items-start justify-between gap-4 p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary/70 via-primary/20 to-transparent" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-dashboard-ink">{value}</p>
          <p className="max-w-[18rem] text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className={`rounded-[20px] p-3 shadow-sm ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
