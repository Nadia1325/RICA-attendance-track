import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileSpreadsheet, Link as LinkIcon, UploadCloud } from "lucide-react";
import { downloadImportTemplate, parseRawWorkbook } from "../lib/excel";
import { RAW_HEADERS } from "../lib/utils";
import { useApp } from "../data/store";
import { apiConfigured, apiRequest, refreshApiData } from "../lib/api";
import { Badge, Button, Card, PageHeader } from "../components/ui";
import { can } from "../lib/permissions";
import type { AttendanceRaw, UploadBatch } from "../types";

export function UploadPage() {
  const { currentUser, importRaw, batches } = useApp();
  const allowed = currentUser && can(currentUser.role, "upload");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<AttendanceRaw[]>([]);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [remoteBatches, setRemoteBatches] = useState<UploadBatch[]>([]);
  const [batchAnomalies, setBatchAnomalies] = useState<{ batchId: string; rows: Record<string, unknown>[] } | null>(null);
  const expected = useMemo(() => RAW_HEADERS.join(" · "), []);

  async function refreshRemoteBatches() {
    const token = localStorage.getItem("rica-api-access-token");
    if (!apiConfigured || !token) return;
    try {
      const rows = await apiRequest<unknown>("/api/attendance/batches", {}, token);
      setRemoteBatches((Array.isArray(rows) ? rows : []).map((b: Record<string, unknown>) => ({ id: String(b.id), fileName: String(b.filename ?? "Attendance import"), uploadedAt: String(b.createdAt ?? ""), uploadedBy: String(b.uploadedById ?? "Admin"), rowCount: Number(b.rowCount ?? 0), duplicates: Number(b.duplicateCount ?? 0), anomalies: Number(b.anomalyCount ?? 0), status: "Imported" as const })));
    } catch { /* The upload result remains visible even when batch history cannot be loaded. */ }
  }

  async function viewBatchAnomalies(batchId: string) {
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) { setError("Sign in again to view batch anomalies."); return; }
    setError("");
    try {
      const result = await apiRequest<unknown>(`/api/attendance/batches/${encodeURIComponent(batchId)}/anomalies`, {}, token);
      setBatchAnomalies({ batchId, rows: Array.isArray(result) ? result as Record<string, unknown>[] : [] });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load batch anomalies."); }
  }

  useEffect(() => { void refreshRemoteBatches(); }, [currentUser]);

  async function prepareFile(file: File) {
    setError(""); setStatus(""); setBusy(true);
    try {
      const rows = parseRawWorkbook(await file.arrayBuffer(), "preview");
      if (!rows.length) throw new Error("No attendance rows were found in this file.");
      setPreview(rows); setSourceFile(file); setFileName(file.name);
    } catch (cause) {
      setPreview([]); setSourceFile(null);
      setError(cause instanceof Error ? cause.message : "Failed to read the attendance file.");
    } finally { setBusy(false); }
  }

  async function loadUrl() {
    setError(""); setStatus(""); setBusy(true);
    try {
      const source = new URL(url.trim());
      if (!(["http:", "https:"].includes(source.protocol))) throw new Error("Enter a valid http or https file URL.");
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Unable to fetch file (HTTP ${response.status}).`);
      const buffer = await response.arrayBuffer();
      const name = decodeURIComponent(source.pathname.split("/").pop() || "attendance.xlsx");
      const file = new File([buffer], name, { type: response.headers.get("content-type") || "application/octet-stream" });
      const rows = parseRawWorkbook(buffer, "preview");
      if (!rows.length) throw new Error("No attendance rows were found at this URL.");
      setPreview(rows); setSourceFile(file); setFileName(name);
    } catch (cause) {
      setPreview([]); setSourceFile(null);
      setError(`${cause instanceof Error ? cause.message : "Unable to load the URL."} The source must allow browser CORS access; otherwise download it and select the file.`);
    } finally { setBusy(false); }
  }

  async function commit() {
    if (!preview.length || !sourceFile) return;
    setError(""); setStatus(""); setBusy(true);
    try {
      if (apiConfigured) {
        const token = localStorage.getItem("rica-api-access-token");
        if (!token) throw new Error("Your session has expired. Sign in again before uploading.");
        const body = new FormData();
        body.append("file", sourceFile, sourceFile.name);
        const response = await apiRequest<Record<string, unknown>>("/api/attendance/upload", { method: "POST", body }, token);
        const batch = (response.batch ?? response.data ?? response) as Record<string, unknown>;
        const batchId = String(batch.batchId ?? "accepted");
        const count = Number(batch.rowCount ?? preview.length);
        setStatus(`Backend import completed: ${Number(batch.insertedCount ?? count)} new of ${count} rows from ${fileName}; ${Number(batch.duplicateCount ?? 0)} duplicates and ${Number(batch.anomalyCount ?? 0)} anomalies. Batch ${batchId}.`);
        await refreshRemoteBatches();
        refreshApiData();
      } else {
        const result = importRaw(preview, fileName);
        setStatus(`Imported ${fileName}: ${preview.length} parsed, ${result.duplicates} duplicates skipped, ${result.anomalies} anomalies flagged. Batch ${result.batchId}.`);
      }
      setPreview([]); setSourceFile(null); setFileName("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed. Please try again.");
    } finally { setBusy(false); }
  }

  if (!allowed) return <Card className="p-8"><h1 className="text-lg font-semibold">Upload restricted</h1><p className="mt-2 text-sm text-slate-500">Only Admin can import fingerprint device exports.</p></Card>;

  return <div>
    <PageHeader title="Data import" subtitle="Preview attendance data, then confirm to import it into the RICA attendance system." />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 px-6 py-10 text-center hover:bg-teal-50">
          <UploadCloud className="text-teal-700" />
          <p className="mt-3 font-semibold">{fileName || "Select attendance file"}</p>
          <p className="mt-1 text-xs text-slate-500">Excel (.xls, .xlsx) or CSV. The file is previewed before import.</p>
          <input type="file" accept=".xls,.xlsx,.csv" className="hidden" onChange={(e) => { const file = e.currentTarget.files?.[0]; if (file) void prepareFile(file); e.currentTarget.value = ""; }} />
          <span className="mt-4"><Button type="button" disabled={busy}>{busy ? "Reading…" : "Choose file"}</Button></span>
        </label>
        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2"><LinkIcon size={17} className="text-teal-700" /><h3 className="font-semibold">Import from URL</h3></div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/attendance.xlsx" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-600/20" /><Button type="button" onClick={() => void loadUrl()} disabled={busy || !url.trim()}>{busy ? "Loading…" : "Load URL"}</Button></div>
          <p className="mt-2 text-xs text-slate-500">The source must allow browser CORS access. After preview, the fetched file is sent to the RICA backend when API mode is configured.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={downloadImportTemplate}>Download template</Button></div>
        {status && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{status}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        {preview.length > 0 && <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Import preview</h2><p className="text-xs text-slate-500">{preview.length} rows parsed from {fileName}.</p></div><Button disabled={busy} onClick={() => void commit()}>{busy ? "Uploading…" : "Confirm import"}</Button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-xs text-slate-500">Rows ready</p><p className="text-2xl font-bold">{preview.length}</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Unique employees</p><p className="text-2xl font-bold">{new Set(preview.map((r) => r.personId)).size}</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Date range</p><p className="text-sm font-bold">{preview.map((r) => r.date).sort()[0]} → {preview.map((r) => r.date).sort().at(-1)}</p></Card></div>
          <div className="mt-4 overflow-auto rounded-xl border border-slate-100"><table className="min-w-[900px] w-full text-left text-xs"><thead className="bg-slate-50"><tr>{["Person ID", "Name", "Department", "Date", "Check-in", "Check-out", "Status"].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr></thead><tbody>{preview.slice(0, 12).map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="px-3 py-2 font-mono">{row.personId}</td><td className="px-3 py-2">{row.name}</td><td className="px-3 py-2">{row.department}</td><td className="px-3 py-2">{row.date}</td><td className="px-3 py-2">{row.checkIn || "—"}</td><td className="px-3 py-2">{row.checkOut || "—"}</td><td className="px-3 py-2">{row.status}</td></tr>)}</tbody></table></div>
          <p className="mt-2 text-xs text-slate-400">Showing the first {Math.min(12, preview.length)} of {preview.length} rows. {apiConfigured ? "The backend validates, imports and detects anomalies after confirmation." : "Demo mode stores the import in this browser."}</p>
        </section>}
        <div className="mt-6"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expected columns</p><p className="mt-2 text-xs leading-6 text-slate-600">{expected}</p></div>
      </Card>
      <Card className="min-w-0 p-4 sm:p-6"><div className="flex items-center gap-2"><FileSpreadsheet size={18} className="text-teal-700" /><h2 className="font-semibold">Recent batches</h2></div><p className="mt-1 text-xs text-slate-500">{apiConfigured ? "Imported attendance batches from the RICA backend." : "Browser demo imports."}</p><ul className="mt-4 space-y-3">{(apiConfigured ? remoteBatches : batches).map((batch) => <li key={batch.id} className="min-w-0 rounded-xl border border-slate-100 p-3"><div className="flex min-w-0 items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{batch.id}</p><Badge tone={batch.status === "Verified" ? "emerald" : batch.status === "Imported" ? "sky" : "amber"}>{batch.status}</Badge></div><p className="mt-1 truncate text-xs text-slate-500">{batch.fileName}</p><p className="mt-1 text-xs text-slate-500">{batch.rowCount} rows · {batch.duplicates} duplicates · {batch.anomalies} anomalies</p>{batch.anomalies > 0 && <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1 text-[11px] text-amber-700"><AlertTriangle size={13} /> Review anomalies</div>{apiConfigured && <Button variant="secondary" onClick={() => void viewBatchAnomalies(batch.id)}>View batch flags</Button>}</div>}</li>)}</ul>{apiConfigured && remoteBatches.length === 0 && <p className="mt-4 text-sm text-slate-500">No backend import batches found.</p>}{batchAnomalies && <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3"><div className="flex items-center justify-between gap-2"><h3 className="min-w-0 truncate text-sm font-semibold">Flags: {batchAnomalies.batchId}</h3><Button variant="ghost" onClick={() => setBatchAnomalies(null)}>Close</Button></div><ul className="mt-2 max-h-72 space-y-2 overflow-y-auto">{batchAnomalies.rows.map((item) => { const record = (item.record ?? {}) as Record<string, unknown>; return <li key={String(item.id)} className="rounded-lg border border-white bg-white p-2 text-xs"><p className="font-semibold">{String(record.name ?? "Employee")} · {String(record.date ?? "")}</p><p className="mt-1 text-slate-600">{String(item.message ?? item.type ?? "Attendance flag")}</p><p className="mt-1 text-slate-400">{item.resolved ? "Resolved" : "Open"}</p></li>; })}{batchAnomalies.rows.length === 0 && <li className="py-3 text-sm text-slate-500">No anomalies in this batch.</li>}</ul></div>}</Card>
    </div>
  </div>;
}
