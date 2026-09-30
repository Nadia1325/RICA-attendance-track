// src/pages/EmployeesPage/EmployeeTable.tsx
import { Badge, Card } from "../../components/ui";
import type { Department, Employee, Shift } from "../../types";

interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
}

export function EmployeeTable({
  employees,
  departments,
  shifts,
  isLoading,
  error,
  errorMessage,
  onRetry,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading employees…
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load employee records."}</p>
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
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {[
                "Person ID",
                "Name",
                "Position",
                "Department",
                "Shift",
                "Status",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((e) => {
              const deptName =
                departments.find((d) => d.id === e.departmentId)?.name ?? "—";
              const shiftName =
                shifts.find((s) => s.id === e.shiftId)?.name ?? "—";

              return (
                <tr
                  key={e.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {e.personId}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {e.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.position}</td>
                  <td className="px-4 py-3 text-slate-600">{deptName}</td>
                  <td className="px-4 py-3 text-slate-600">{shiftName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={e.status === "Active" ? "emerald" : "rose"}>
                      {e.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}

            {employees.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No employees match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
