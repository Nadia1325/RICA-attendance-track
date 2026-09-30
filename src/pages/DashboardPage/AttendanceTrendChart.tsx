// src/pages/DashboardPage/AttendanceTrendChart.tsx
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card } from "../../components/ui";

export type TrendPoint = {
  date: string;
  presentPct: number;
  latePct: number;
  absentPct: number;
};

interface AttendanceTrendChartProps {
  data: TrendPoint[];
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <Card className="p-5 xl:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900">Attendance trend</h2>
          <p className="text-xs text-slate-500">
            Daily attendance, late and absence rates
          </p>
        </div>
        <Badge tone="teal">All graph values are %</Badge>
      </div>
      <div className="h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Area
              type="monotone"
              dataKey="presentPct"
              name="Attendance"
              stroke="#0f766e"
              fill="url(#p)"
            />
            <Area
              type="monotone"
              dataKey="latePct"
              name="Late"
              stroke="#d97706"
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="absentPct"
              name="Absent"
              stroke="#e11d48"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
