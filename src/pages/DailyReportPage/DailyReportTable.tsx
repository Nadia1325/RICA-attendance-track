// src/pages/DailyReportPage/DailyReportTable.tsx
import { Card } from "../../components/ui";

export type ReportRow = {
  No: number;
  Name: string;
  "Person ID": string;
  Department: string;
  Date: string;
  Week: string;
  Timetable: string;
  "Check-in": string;
  "Check-out": string;
  Status: string;
};

interface DailyReportTableProps {
  rows: ReportRow[];
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
}

export function DailyReportTable({
  rows,
  isLoading,
  error,
  errorMessage,
  onRetry,
}: DailyReportTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading daily report...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load daily report."}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-slate-700 underline hover:text-slate-900"
        >
          Try again
        </button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-teal-950 text-xs uppercase tracking-wide text-teal-50">
            <tr>
              {[
                "No.",
                "Name",
                "Person ID",
                "Department",
                "Date",
                "Week",
                "Timetable",
                "Check-in",
                "Check-out",
                "Status",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, idx) => (
              <tr
                key={`${r["Person ID"]}-${r.Date}-${idx}`}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-2 text-slate-500">{r.No}</td>
                <td className="px-4 py-2 font-medium text-slate-900">{r.Name}</td>
                <td className="px-4 py-2 font-mono text-xs text-slate-600">
                  {r["Person ID"]}
                </td>
                <td className="px-4 py-2 text-slate-600">{r.Department}</td>
                <td className="px-4 py-2 text-slate-600">{r.Date}</td>
                <td className="px-4 py-2 text-slate-600">{r.Week}</td>
                <td className="px-4 py-2 text-slate-600">{r.Timetable}</td>
                <td className="px-4 py-2 text-slate-600">{r["Check-in"]}</td>
                <td className="px-4 py-2 text-slate-600">{r["Check-out"]}</td>
                <td className="px-4 py-2 text-slate-700 font-medium">
                  {r.Status}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No records for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}