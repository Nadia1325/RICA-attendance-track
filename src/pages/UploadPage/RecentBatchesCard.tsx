import { AlertTriangle, FileSpreadsheet, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "../../components/ui";

export interface BatchItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  duplicates: number;
  anomalies: number;
  status: string;
}

export interface BatchAnomalies {
  batchId: string;
  rows: Record<string, unknown>[];
}

interface RecentBatchesCardProps {
  batches: BatchItem[];
  batchAnomalies: BatchAnomalies | null;
  onViewAnomalies: (batchId: string) => void;
  onCloseAnomalies: () => void;
  onDeleteBatch: (batch: BatchItem) => void;
}

export function RecentBatchesCard({
  batches,
  batchAnomalies,
  onViewAnomalies,
  onCloseAnomalies,
  onDeleteBatch,
}: RecentBatchesCardProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet size={18} className="text-teal-700" />
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent batches</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">Attendance batches imported into the RICA system.</p>

      <ul className="mt-4 space-y-3">
        {batches.map((batch) => (
          <li key={batch.id} className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{batch.fileName}</p>
              <Badge tone={batch.status === "Verified" ? "emerald" : batch.status === "Imported" ? "sky" : "amber"}>
                {batch.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {batch.uploadedAt ? new Date(batch.uploadedAt).toLocaleString() : "Date unavailable"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {batch.rowCount} rows · {batch.duplicates} duplicates · {batch.anomalies} anomalies
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {batch.anomalies > 0 && (
                <Button variant="secondary" onClick={() => onViewAnomalies(batch.id)}>
                  <AlertTriangle size={14} />
                  View batch flags
                </Button>
              )}
              <Button
                variant="danger"
                className="ml-auto px-2"
                title="Delete imported batch"
                aria-label={`Delete ${batch.fileName}`}
                onClick={() => onDeleteBatch(batch)}
              >
                <Trash2 size={15} />
                <span className="sr-only sm:not-sr-only">Delete</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {batches.length === 0 && <p className="mt-4 text-sm text-slate-500">No import batches yet.</p>}

      {batchAnomalies && (
        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 truncate text-sm font-semibold text-slate-800">Flags: {batchAnomalies.batchId}</h3>
            <Button variant="ghost" onClick={onCloseAnomalies}>Close</Button>
          </div>
          <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
            {batchAnomalies.rows.map((item) => {
              const record = (item.record ?? {}) as Record<string, unknown>;
              return (
                <li key={String(item.id)} className="rounded-lg border border-white bg-white p-2 text-xs shadow-xs">
                  <p className="font-semibold text-slate-800">{String(record.name ?? "Employee")} · {String(record.date ?? "")}</p>
                  <p className="mt-1 text-slate-600">{String(item.message ?? item.type ?? "Attendance flag")}</p>
                  <p className="mt-1 text-slate-400">{item.resolved ? "Resolved" : "Open"}</p>
                </li>
              );
            })}
            {batchAnomalies.rows.length === 0 && <li className="py-3 text-sm text-slate-500">No anomalies in this batch.</li>}
          </ul>
        </div>
      )}
    </Card>
  );
}
