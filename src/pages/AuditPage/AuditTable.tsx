// src/pages/AuditPage/AuditTable.tsx
import { Badge, Card } from "../../components/ui";
import type { AuditLog } from "../../types";

interface AuditTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
}

export function AuditTable({
  logs,
  isLoading,
  error,
  errorMessage,
  onRetry,
}: AuditTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading audit logs...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load audit logs."}</p>
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
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {["Time", "User", "Action", "Entity", "Details", "Delta"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((l) => {
              const formattedDate = isNaN(Date.parse(l.timestamp))
                ? l.timestamp
                : new Date(l.timestamp).toLocaleString();

              const actionLower = l.action.toLowerCase();
              const badgeTone = actionLower.includes("upload")
                ? "sky"
                : actionLower.includes("edit") || actionLower.includes("update")
                  ? "amber"
                  : actionLower.includes("login")
                    ? "teal"
                    : actionLower.includes("delete")
                      ? "rose"
                      : "slate";

              return (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {l.userName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={badgeTone}>{l.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {l.entity}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{l.details}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-[200px] truncate">
                    {l.delta || "—"}
                  </td>
                </tr>
              );
            })}

            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  No audit logs match your search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
