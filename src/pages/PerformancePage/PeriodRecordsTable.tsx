// src/pages/PerformancePage/PeriodRecordsTable.tsx
import { Card } from "../../components/ui";

export type RemotePeriodRow = {
  id?: string;
  person_id?: string;
  name?: string;
  department?: string;
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  late_min?: number;
};

interface PeriodRecordsTableProps {
  period: "month" | "quarter" | "year";
  rows: RemotePeriodRow[];
  isLoading?: boolean;
}

export function PeriodRecordsTable({ period, rows, isLoading }: PeriodRecordsTableProps) {
  return (
    <Card className="mt-5 min-w-0 overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">
          Attendance records for this {period}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Loaded directly from RICA period report service.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {[
                "Date",
                "Employee",
                "Person ID",
                "Department",
                "Check-in",
                "Check-out",
                "Status",
                "Late minutes",
              ].map((heading) => (
                <th key={heading} className="px-3 py-2 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Loading detailed attendance records...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No attendance records found in this period.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id ?? `${row.person_id}-${row.date}-${index}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {row.date}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {row.person_id}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{row.department}</td>
                  <td className="px-3 py-2 text-slate-600">{row.check_in || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.check_out || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.status}</td>
                  <td className="px-3 py-2 text-slate-600">{row.late_min ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}