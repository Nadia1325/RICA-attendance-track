// src/pages/AttendancePage/AttendanceTable.tsx
import { Badge, Card } from "../../components/ui";
import type { AttendanceFinal, Department } from "../../types";

interface AttendanceTableProps {
  records: AttendanceFinal[];
  departments: Department[];
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
}

export function AttendanceTable({
  records,
  departments,
  isLoading,
  error,
  errorMessage,
  onRetry,
}: AttendanceTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading verified attendance records...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load attendance records."}</p>
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
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {[
                "Name",
                "Dept",
                "Date",
                "In",
                "Out",
                "Late",
                "Status",
                "Verified",
                "Notes",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => {
              const dept = departments.find((d) => d.id === r.departmentId);
              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.personId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {dept?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {r.date} {r.week ? `· ${r.week}` : ""}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.checkIn || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.checkOut || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.late > 0 ? `${r.late}m` : "0"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        r.status === "Absent"
                          ? "rose"
                          : r.status === "LV"
                            ? "sky"
                            : r.status === "Weekend" || r.status === "Holiday"
                              ? "amber"
                              : "emerald"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.verified ? "teal" : "amber"}>
                      {r.verified ? "Yes" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                    {r.notes || "—"}
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No verified attendance records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
