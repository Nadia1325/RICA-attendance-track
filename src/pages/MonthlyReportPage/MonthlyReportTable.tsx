// src/pages/MonthlyReportPage/MonthlyReportTable.tsx
import { Card } from "../../components/ui";
import { bandColor, formatMinutes } from "../../lib/utils";
import type { PerformanceBand } from "../../types/types";

export interface SummaryRow {
  Name: string;
  "Person ID": string;
  Department: string;
  "Working days": number;
  Present: number;
  Late: number;
  "Attendance %": number;
  "Punctuality %": number;
  Band: PerformanceBand;
  "Late minutes": number;
  [key: string]: string | number | PerformanceBand;   // ← ADD THIS
}

interface MonthlyReportTableProps {
  summary: SummaryRow[];
  isLoading: boolean;
}

// ✅ Explicit column order (not derived from data)
const COLUMNS: Array<{
  key: keyof SummaryRow;
  label: string;
  align?: "left" | "right" | "center";
}> = [
  { key: "Name", label: "Name" },
  { key: "Person ID", label: "Person ID" },
  { key: "Department", label: "Department" },
  { key: "Working days", label: "Working days", align: "right" },
  { key: "Present", label: "Present", align: "right" },
  { key: "Late", label: "Late", align: "right" },
  { key: "Attendance %", label: "Attendance %", align: "right" },
  { key: "Punctuality %", label: "Punctuality %", align: "right" },
  { key: "Band", label: "Band" },
  { key: "Late minutes", label: "Late minutes", align: "right" },
];

/**
 * Safely coerce an arbitrary string into a PerformanceBand.
 */
function toBand(value: string): PerformanceBand {
  const allowed: PerformanceBand[] = [
    "Excellent",
    "Good",
    "Needs Improvement",
    "Warning",
  ];
  return (allowed as string[]).includes(value)
    ? (value as PerformanceBand)
    : "Warning";
}

export function MonthlyReportTable({
  summary,
  isLoading,
}: MonthlyReportTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3 font-semibold">#</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 font-semibold ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading monthly report...
                </td>
              </tr>
            ) : summary.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No employee records for this month.
                </td>
              </tr>
            ) : (
              summary.map((r, idx) => (
                <tr
                  key={r["Person ID"] || idx}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-3 py-3 text-slate-500">{idx + 1}</td>

                  <td className="px-3 py-3 font-medium text-slate-900">
                    {r.Name}
                  </td>

                  <td className="px-3 py-3 font-mono text-xs text-slate-600">
                    {r["Person ID"]}
                  </td>

                  <td className="px-3 py-3 text-slate-600">
                    {r.Department || "—"}
                  </td>

                  <td className="px-3 py-3 text-right text-slate-700">
                    {r["Working days"]}
                  </td>

                  <td className="px-3 py-3 text-right text-slate-700">
                    {r.Present}
                  </td>

                  <td className="px-3 py-3 text-right text-slate-700">
                    {r.Late}
                  </td>

                  <td className="px-3 py-3 text-right font-medium text-slate-900">
                    {r["Attendance %"].toFixed(1)}%
                  </td>

                  <td className="px-3 py-3 text-right font-medium text-slate-900">
                    {r["Punctuality %"].toFixed(1)}%
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(
                        toBand(r.Band),
                      )}`}
                    >
                      {r.Band}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-right text-slate-600">
                    {formatMinutes(r["Late minutes"])}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {summary.length > 0 && !isLoading && (
            <tfoot className="bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  Total ({summary.length} employees)
                </td>
                <td className="px-3 py-3 text-right">
                  {summary.reduce((s, r) => s + r["Working days"], 0)}
                </td>
                <td className="px-3 py-3 text-right">
                  {summary.reduce((s, r) => s + r.Present, 0)}
                </td>
                <td className="px-3 py-3 text-right">
                  {summary.reduce((s, r) => s + r.Late, 0)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
}
