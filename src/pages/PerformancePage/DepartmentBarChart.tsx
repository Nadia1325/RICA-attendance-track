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
  punctuality?: number;
}

interface DepartmentBarChartProps {
  data: DepartmentChartData[];
  isLoading?: boolean;
}

export function DepartmentBarChart({
  data,
  isLoading,
}: DepartmentBarChartProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 p-8 text-center text-sm text-slate-500">
        Loading department chart...
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="mt-6 p-8 text-center text-sm text-slate-500">
        No department data available.
      </Card>
    );
  }

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
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar dataKey="attendance" fill="#0f766e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
