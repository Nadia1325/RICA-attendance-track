// src/pages/UploadPage/PreviewSection.tsx
import { Button, Card } from "../../components/ui";
import type { AttendanceRaw } from "../../types/types";

interface PreviewSectionProps {
  preview: AttendanceRaw[];
  fileName: string;
  busy: boolean;
  onConfirm: () => void;
}

export function PreviewSection({
  preview,
  fileName,
  busy,
  onConfirm,
}: PreviewSectionProps) {
  if (preview.length === 0) return null;

  const uniquePeople = new Set(preview.map((r) => r.personId)).size;
  const sortedDates = preview.map((r) => r.date).sort();
  const startDate = sortedDates[0];
  const endDate = sortedDates.at(-1);

  return (
    <section className="mt-6 border-t border-slate-100 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Import preview</h2>
          <p className="text-xs text-slate-500">
            {preview.length} rows parsed from {fileName}.
          </p>
        </div>
        <Button disabled={busy} onClick={onConfirm}>
          {busy ? "Uploading…" : "Confirm import"}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Rows ready</p>
          <p className="text-2xl font-bold text-slate-900">{preview.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Unique employees</p>
          <p className="text-2xl font-bold text-slate-900">{uniquePeople}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Date range</p>
          <p className="text-sm font-bold text-slate-900">
            {startDate} → {endDate}
          </p>
        </Card>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-100">
        <table className="min-w-[900px] w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {[
                "Person ID",
                "Name",
                "Department",
                "Date",
                "Check-in",
                "Check-out",
                "Status",
              ].map((heading) => (
                <th key={heading} className="px-3 py-2 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {preview.slice(0, 12).map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2 font-mono">{row.personId}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.department}</td>
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2">{row.checkIn || "—"}</td>
                <td className="px-3 py-2">{row.checkOut || "—"}</td>
                <td className="px-3 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Showing the first {Math.min(12, preview.length)} of {preview.length} rows. The server validates, imports, and detects anomalies after confirmation.
      </p>
    </section>
  );
}