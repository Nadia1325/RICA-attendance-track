// src/pages/PerformancePage/PerformanceGauges.tsx
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "../../components/ui";

interface KpiGaugeCardProps {
  title: string;
  subtitle: string;
  label: string;
  value: number;
  fillColor: string;
}

function KpiGaugeCard({
  title,
  subtitle,
  label,
  value,
  fillColor,
}: KpiGaugeCardProps) {
  const chartData = [
    { value: Number(value.toFixed(1)) },
    { value: Number((100 - value).toFixed(1)) },
  ];

  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="text-xs text-slate-500">{subtitle}</p>
      <div className="relative mx-auto mt-3 h-48 w-48 max-w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={55}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={fillColor} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">
            {value.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      </div>
    </Card>
  );
}

interface PerformanceGaugesProps {
  avgAttendance: number;
  avgPunctuality: number;
}

export function PerformanceGauges({
  avgAttendance,
  avgPunctuality,
}: PerformanceGaugesProps) {
  return (
    <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2">
      <KpiGaugeCard
        title="Attendance KPI"
        subtitle="Average attendance rate"
        label="attendance"
        value={avgAttendance}
        fillColor="#0f766e"
      />
      <KpiGaugeCard
        title="Punctuality KPI"
        subtitle="Average punctuality rate"
        label="punctuality"
        value={avgPunctuality}
        fillColor="#0284c7"
      />
    </div>
  );
}