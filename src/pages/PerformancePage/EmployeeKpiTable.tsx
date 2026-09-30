// src/pages/PerformancePage/EmployeeKpiTable.tsx
import { Card } from "../../components/ui";
import { bandColor } from "../../lib/utils";
import type { PerformanceBand } from "../../types/types";

export interface EmployeeKpiRow {
  id: string;
  name: string;
  department: string;
  present: number;
  workingDays: number;
  attendancePct: number;
  punctualityPct: number;
  band: PerformanceBand | string;
}

interface EmployeeKpiTableProps {
  rows: EmployeeKpiRow[];
  isLoading?: boolean;
}

function toBand(v: PerformanceBand | string): PerformanceBand {
  const allowed: PerformanceBand[] = [
    "Excellent",
    "Good",
    "Needs Improvement",
    "Warning",
  ];
  return (allowed as string[]).includes(v) ? (v as PerformanceBand) : "Warning";
}

export function EmployeeKpiTable({ rows, isLoading }: EmployeeKpiTableProps) {
  return (
    <Card className="mt-5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {[
                "Employee",
                "Department",
                "Present",
                "Attendance %",
                "Punctuality %",
                "Band",
              ].map((h) => (
                <th key={h} className="px-4 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading employee performance metrics...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No employee KPI records found for this period.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.department}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.present}/{r.workingDays}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.attendancePct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.punctualityPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(
                        toBand(r.band),
                      )}`}
                    >
                      {r.band}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
