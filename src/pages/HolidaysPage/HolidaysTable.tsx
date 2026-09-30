// src/pages/HolidaysPage/HolidaysTable.tsx
import { Trash2 } from "lucide-react";
import { Badge, Card } from "../../components/ui";
import type { Holiday } from "../../types";

interface HolidaysTableProps {
  holidays: Holiday[];
  canManage: boolean;
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry: () => void;
  onDelete: (holiday: Holiday) => void;
  isDeleting: boolean;
}

export function HolidaysTable({
  holidays,
  canManage,
  isLoading,
  error,
  errorMessage,
  onRetry,
  onDelete,
  isDeleting,
}: HolidaysTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading holidays...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-rose-600">
        <p>{errorMessage || "Failed to load holidays."}</p>
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
        <table className="min-w-[650px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              {canManage && (
                <th className="px-4 py-3 font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holidays.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 text-slate-600">{h.date}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {h.name}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={h.type === "Public" ? "teal" : "sky"}>
                    {h.type}
                  </Badge>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 transition-colors"
                        title="Delete holiday"
                        aria-label="Delete holiday"
                        onClick={() => onDelete(h)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {holidays.length === 0 && (
              <tr>
                <td
                  colSpan={canManage ? 4 : 3}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No holidays configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
