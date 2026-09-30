// src/pages/LeavesPage/LeavesTable.tsx
import { Badge, Card } from "../../components/ui";
import type { Department, Leave } from "../../types";

interface LeavesTableProps {
  leaves: Leave[];
  departments: Department[];
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
}

export function LeavesTable({
  leaves,
  departments,
  isLoading,
  error,
  errorMessage,
  onRetry,
}: LeavesTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading leave records...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load leave records."}</p>
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
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {["Employee", "Type", "Dates", "Days", "Reason", "Status"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((l) => {
              const deptName =
                departments.find((d) => d.id === l.departmentId)?.name ?? "—";

              const statusBadgeTone =
                l.status === "Approved"
                  ? "emerald"
                  : l.status === "Rejected"
                  ? "rose"
                  : "amber";

              return (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{l.employeeName}</p>
                    <p className="text-xs text-slate-500">{deptName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="sky">{l.type}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                    {l.startDate} → {l.endDate}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {l.days}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[250px] truncate">
                    {l.reason}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusBadgeTone}>{l.status}</Badge>
                  </td>
                </tr>
              );
            })}

            {leaves.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No leave records available in your scope.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}