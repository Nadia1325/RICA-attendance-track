// src/pages/UploadPage/index.tsx
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { downloadImportTemplate, parseRawWorkbook } from "../../lib/excel";
import { RAW_HEADERS } from "../../lib/utils";
import { useApp } from "../../data/store";
import {
  errorMessage,
  useLazyGetBatchAnomaliesQuery,
  useUploadAttendanceMutation,
  useGetBatchesQuery,
  useDeleteBatchMutation,
  mapBatch,
} from "../../services/api";
// add to your existing react import

import { Button, Card, ConfirmDialog, PageHeader } from "../../components/ui";
import { can } from "../../lib/permissions";
import type { AttendanceRaw } from "../../types/types";

import { FileDropzone } from "./FileDropzone";
import { PreviewSection } from "./PreviewSection";
import {
  type BatchAnomalies,
  type BatchItem,
  RecentBatchesCard,
} from "./RecentBatchesCard";
import { UrlImportForm } from "./UrlImportForm";

interface ImportSummary {
  fileName: string;
  insertedCount: number;
  rowCount: number;
  duplicateCount: number;
  anomalyCount: number;
}

export function UploadPage() {
  const { currentUser } = useApp();
  const allowed = Boolean(currentUser && can(currentUser.role, "upload"));
  const { data: rawBatches = [] } = useGetBatchesQuery(undefined, {
    skip: !currentUser,
  });
  const batches = useMemo(() => rawBatches.map(mapBatch), [rawBatches]);
  const [uploadAttendance, { isLoading: uploading }] =
    useUploadAttendanceMutation();
  const [loadBatchAnomalies] = useLazyGetBatchAnomaliesQuery();
  const [deleteBatch] = useDeleteBatchMutation();

  const [status, setStatus] = useState("");
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null,
  );
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const busy = reading || uploading;

  const [preview, setPreview] = useState<AttendanceRaw[]>([]);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [batchAnomalies, setBatchAnomalies] = useState<BatchAnomalies | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<BatchItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const expected = useMemo(() => RAW_HEADERS.join(" · "), []);

  async function handleViewBatchAnomalies(batchId: string) {
    setError("");
    try {
      const rows = await loadBatchAnomalies(batchId).unwrap();
      setBatchAnomalies({ batchId, rows });
    } catch (cause) {
      setError(errorMessage(cause, "Unable to load batch anomalies."));
    }
  }

  async function handleDeleteBatch(batch: BatchItem) {
    setError("");
    setDeleting(true);
    try {
      await deleteBatch(batch.id).unwrap();
      if (batchAnomalies?.batchId === batch.id) setBatchAnomalies(null);
      setImportSummary(null);
      setStatus(`${batch.fileName} was deleted.`);
      setDeleteTarget(null);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to delete this batch."));
    } finally {
      setDeleting(false);
    }
  }

  async function handlePrepareFile(file: File) {
    setError("");
    setStatus("");
    setImportSummary(null);
    setReading(true);
    try {
      const rows = parseRawWorkbook(await file.arrayBuffer(), "preview");
      if (!rows.length) {
        setPreview([]);
        setSourceFile(file);
        setFileName(file.name);
        setStatus(
          "Preview is unavailable for this workbook. The server will validate it during upload.",
        );
        return;
      }
      setPreview(rows);
      setSourceFile(file);
      setFileName(file.name);
    } catch (cause) {
      setPreview([]);
      setSourceFile(null);
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to read the attendance file.",
      );
    } finally {
      setReading(false);
    }
  }

  async function handleLoadUrl() {
    setError("");
    setStatus("");
    setImportSummary(null);
    setReading(true);
    try {
      const source = new URL(url.trim());
      if (!["http:", "https:"].includes(source.protocol)) {
        throw new Error("Enter a valid http or https file URL.");
      }
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Unable to fetch file (HTTP ${response.status}).`);
      }
      const buffer = await response.arrayBuffer();
      const name = decodeURIComponent(
        source.pathname.split("/").pop() || "attendance.xlsx",
      );
      const file = new File([buffer], name, {
        type:
          response.headers.get("content-type") || "application/octet-stream",
      });
      const rows = parseRawWorkbook(buffer, "preview");
      if (!rows.length) {
        setPreview([]);
        setSourceFile(file);
        setFileName(name);
        setStatus(
          "Preview is unavailable for this workbook. The server will validate it during upload.",
        );
        return;
      }
      setPreview(rows);
      setSourceFile(file);
      setFileName(name);
    } catch (cause) {
      setPreview([]);
      setSourceFile(null);
      setError(
        `${
          cause instanceof Error ? cause.message : "Unable to load the URL."
        } The source must allow browser CORS access; otherwise download it and select the file.`,
      );
    } finally {
      setReading(false);
    }
  }

  async function handleCommit() {
    if (!sourceFile) return;
    setError("");
    setStatus("");
    setImportSummary(null);
    try {
      const response = await uploadAttendance(sourceFile).unwrap();
      const batch = (response.batch ?? response.data ?? response) as Record<
        string,
        unknown
      >;
      const count = Number(batch.rowCount ?? preview.length);
      setImportSummary({
        fileName,
        insertedCount: Number(batch.insertedCount ?? count),
        rowCount: count,
        duplicateCount: Number(batch.duplicateCount ?? 0),
        anomalyCount: Number(batch.anomalyCount ?? 0),
      });
      setPreview([]);
      setSourceFile(null);
      setFileName("");
    } catch (cause) {
      setError(errorMessage(cause, "Upload failed. Please try again."));
    }
  }

  if (!allowed) {
    return (
      <Card className="p-8">
        <h1 className="text-lg font-semibold">Upload restricted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Only Admin can import fingerprint device exports.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Data import"
        subtitle="Preview attendance data, then confirm to import it into the RICA attendance system."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <FileDropzone
            fileName={fileName}
            busy={busy}
            onFileSelect={(file) => void handlePrepareFile(file)}
            onDownloadTemplate={downloadImportTemplate}
          />

          <UrlImportForm
            url={url}
            busy={busy}
            onUrlChange={setUrl}
            onLoadUrl={() => void handleLoadUrl()}
          />

          {importSummary && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <div className="min-w-0">
                  <p className="font-semibold">Import completed</p>
                  <p className="mt-1 truncate text-sm text-emerald-800">
                    {importSummary.fileName}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-white/70 px-3 py-2">
                  <p className="text-xs text-emerald-700">Imported</p>
                  <p className="mt-1 text-lg font-semibold">{importSummary.insertedCount}</p>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-2">
                  <p className="text-xs text-emerald-700">Rows processed</p>
                  <p className="mt-1 text-lg font-semibold">{importSummary.rowCount}</p>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-2">
                  <p className="text-xs text-emerald-700">Duplicates</p>
                  <p className="mt-1 text-lg font-semibold">{importSummary.duplicateCount}</p>
                </div>
              </div>
              {importSummary.anomalyCount > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <AlertTriangle className="shrink-0 text-amber-600" size={16} />
                  <span>
                    {importSummary.anomalyCount} anomal
                    {importSummary.anomalyCount === 1 ? "y" : "ies"} need review.
                  </span>
                </div>
              )}
            </div>
          )}

          {status && !importSummary && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {status}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}

          <PreviewSection
            preview={preview}
            fileName={fileName}
            busy={busy}
            onConfirm={() => void handleCommit()}
          />

          {sourceFile && preview.length === 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <Button disabled={busy} onClick={() => void handleCommit()}>
                {busy ? "Uploading…" : "Upload for server validation"}
              </Button>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Expected columns
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-600 font-mono">
              {expected}
            </p>
          </div>
        </Card>

        <RecentBatchesCard
          batches={batches}
          batchAnomalies={batchAnomalies}
          onViewAnomalies={(batchId) => void handleViewBatchAnomalies(batchId)}
          onCloseAnomalies={() => setBatchAnomalies(null)}
          onDeleteBatch={(batch) => setDeleteTarget(batch)}
        />
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete imported batch?"
        description={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.fileName} and all attendance records from this import. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete batch"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) void handleDeleteBatch(deleteTarget);
        }}
      />
    </div>
  );
}

export default UploadPage;
