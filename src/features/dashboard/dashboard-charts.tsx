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
      <div className="panel p-5">
        <div className="mb-4">
          <h3 className="section-title">صحة المؤشرات</h3>
          <p className="section-subtitle">
            توزيع مؤشرات الأداء حسب الحالة الحالية
          </p>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-4">
          <h3 className="section-title">اتجاه التقدم</h3>
          <p className="section-subtitle">
            متوسط التقدم عبر الخطط النشطة في البيئة التجريبية
          </p>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressTrend}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0c6d62" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

