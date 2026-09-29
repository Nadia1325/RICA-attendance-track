// src/pages/PerformancePage/DepartmentBarChart.tsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui";

export interface DepartmentChartData {
  name: string;
  attendance: number;
}

interface DepartmentBarChartProps {
  data: DepartmentChartData[];
}

export function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  return (
    <Card className="mt-6 p-5">
      <h2 className="mb-4 font-semibold text-slate-900">
        Department attendance %
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="attendance" fill="#0f766e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}