"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const pieColors = ["#27835e", "#d88a1d", "#b83f3f"];

type DashboardChartsProps = {
  kpiHealth: Array<{ name: string; value: number }>;
  progressTrend: Array<{ name: string; value: number }>;
};

export function DashboardCharts({
  kpiHealth,
  progressTrend
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel overflow-hidden p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="section-title">صحة المؤشرات</h3>
            <p className="section-subtitle">
              توزيع سجل المؤشرات بحسب الحالة الحالية ومستوى التدخل المطلوب.
            </p>
          </div>
          <div className="rounded-full bg-dashboard.tint px-3 py-1 text-xs font-semibold text-primary">
            لوحة متابعة
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={kpiHealth}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={96}
                paddingAngle={4}
              >
                {kpiHealth.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [Number(value ?? 0), String(name ?? "")]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #d7dfdc",
                  background: "#ffffff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {kpiHealth.map((entry, index) => (
            <span
              key={entry.name}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm text-dashboard-ink"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: pieColors[index % pieColors.length] }}
              />
              {entry.name}: {entry.value}
            </span>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="section-title">اتجاه التقدم</h3>
            <p className="section-subtitle">
              متوسط التقدم عبر الخطط النشطة بما يدعم القراءة التنفيذية السريعة.
            </p>
          </div>
          <div className="rounded-full bg-dashboard.tint px-3 py-1 text-xs font-semibold text-primary">
            نبض التنفيذ
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressTrend}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0)}%`, "متوسط التقدم"]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #d7dfdc",
                  background: "#ffffff"
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0c6d62" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
