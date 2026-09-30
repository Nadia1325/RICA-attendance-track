import { useEffect, useState } from "react";
import { Card, PageHeader } from "../components/ui";
import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { errorMessage, useGetRawRecordQuery } from "../services/api";
import type { AttendanceFinal } from "../types/types";
import { VerificationForm } from "./VerificationForm";
import { VerificationQueue } from "./VerificationQueue";

export function VerificationPage() {
  const { currentUser, scopedAnomalies, finals, verifyRecord, departments } = useApp();
  const allowed = currentUser && can(currentUser.role, "verify");

  const open = scopedAnomalies().filter((a) => !a.resolved);

  const [selected, setSelected] = useState<string>("");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [draft, setDraft] = useState<Partial<AttendanceFinal>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selected && open.length > 0) {
      setSelected(open[0].attendanceId);
    }
  }, [open, selected]);

  const filteredOpen = open.filter(
    (a) =>
      `${a.name} ${a.personId} ${a.message}`.toLowerCase().includes(q.toLowerCase().trim()) &&
      (!date || a.date === date)
  );

  const record = finals.find((r) => r.id === selected);
  const rowQ = useGetRawRecordQuery(selected, { skip: !selected });

  useEffect(() => {
    const row = rowQ.data;
    if (!row) return;

    const rawStatus = String(row.status ?? "").toUpperCase();
    const status: AttendanceFinal["status"] =
      rawStatus === "A" ? "Absent" :
      rawStatus === "LV" ? "LV" :
      rawStatus === "#" ? "Weekend" :
      rawStatus === "HOLIDAY" ? "Holiday" : "Attended";

    setDraft({
      checkIn: String(row.check_in ?? ""),
      checkOut: String(row.check_out ?? ""),
      work: Number(row.work_min ?? 0),
      attended: Number(row.attended_min ?? 0),
      late: Number(row.late_min ?? 0),
      early: Number(row.early_min ?? 0),
      absent: Number(row.absent_min ?? 0),
      leave: Number(row.leave_min ?? 0),
      status,
    });
    setNote(String(row.notes ?? ""));
  }, [rowQ.data]);

  useEffect(() => {
    if (rowQ.isError) {
      setError(errorMessage(rowQ.error, "Unable to load the selected attendance row."));
    }
  }, [rowQ.isError, rowQ.error]);

  async function saveRecord(patch: Partial<AttendanceFinal>, message = note) {
    if (!record) return;
    setError("");
    setSaving(true);
    try {
      await verifyRecord(record.id, patch, message);
      setSelected("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save this attendance correction.");
    } finally {
      setSaving(false);
    }
  }

  function handleSelect(id: string) {
    setSelected(id);
    setError("");
  }

  if (!allowed) {
    return (
      <Card className="p-8">
        <h1 className="text-lg font-semibold">Verification restricted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Admin can verify all records. Head of Office/Unit can verify their own unit only.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="HR verification queue"
        subtitle="Flagged missing punches, negative work minutes, status mismatches, and absent inconsistencies."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <VerificationQueue
          open={open}
          filteredOpen={filteredOpen}
          selected={selected}
          q={q}
          date={date}
          departments={departments}
          onSearchChange={setQ}
          onDateChange={setDate}
          onSelect={handleSelect}
        />

        <VerificationForm
          record={record}
          isLoading={rowQ.isLoading}
          draft={draft}
          note={note}
          error={error}
          saving={saving}
          setDraft={setDraft}
          setNote={setNote}
          onSave={saveRecord}
        />
      </div>
    </div>
  );
}