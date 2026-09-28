import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Badge, Button, Card, DateField, Input, PageHeader, Select } from "../components/ui";
import type { AttendanceFinal } from "../types";
import { apiConfigured, apiRequest } from "../lib/api";

export function VerificationPage() {
  const { currentUser, scopedAnomalies, finals, verifyRecord, departments } = useApp();
  const allowed = currentUser && can(currentUser.role, "verify") && (!apiConfigured || currentUser.role === "admin");
  const open = scopedAnomalies().filter((a) => !a.resolved);
  const [selected, setSelected] = useState(open[0]?.attendanceId ?? "");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const filteredOpen = open.filter((a) => `${a.name} ${a.personId} ${a.message}`.toLowerCase().includes(q.toLowerCase().trim()) && (!date || a.date === date));
  const record = finals.find((r) => r.id === selected);
  const [draft, setDraft] = useState<Partial<AttendanceFinal>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!apiConfigured || !selected) return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    let active = true;
    void apiRequest<Record<string, unknown>>(`/api/attendance/raw/${encodeURIComponent(selected)}`, {}, token)
      .then((row) => {
        if (!active) return;
        const rawStatus = String(row.status ?? "").toUpperCase();
        const status: AttendanceFinal["status"] = rawStatus === "A" ? "Absent" : rawStatus === "LV" ? "LV" : rawStatus === "#" ? "Weekend" : rawStatus === "HOLIDAY" ? "Holiday" : "Attended";
        setDraft({ checkIn: String(row.check_in ?? ""), checkOut: String(row.check_out ?? ""), work: Number(row.work_min ?? 0), attended: Number(row.attended_min ?? 0), late: Number(row.late_min ?? 0), early: Number(row.early_min ?? 0), absent: Number(row.absent_min ?? 0), leave: Number(row.leave_min ?? 0), status });
        setNote(String(row.notes ?? ""));
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load the selected attendance row."); });
    return () => { active = false; };
  }, [selected]);

  async function saveRecord(patch: Partial<AttendanceFinal>, message = note) {
    if (!record) return;
    setError(""); setSaving(true);
    try { await verifyRecord(record.id, patch, message); setSelected(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save this attendance correction."); }
    finally { setSaving(false); }
  }

  function load(id: string) {
    const r = finals.find((x) => x.id === id);
    setSelected(id);
    setDraft({
      checkIn: r?.checkIn,
      checkOut: r?.checkOut,
      work: r?.work,
      attended: r?.attended,
      late: r?.late,
      early: r?.early,
      absent: r?.absent,
      status: r?.status,
    });
    setNote(r?.notes ?? "");
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
        <Card className="lg:col-span-2">
          <div className="border-b border-slate-100 px-4 py-3"><div className="text-sm font-semibold">{open.length} open flags</div><div className="mt-3 space-y-2"><Input placeholder="Search name, ID or issue…" value={q} onChange={(e) => setQ(e.target.value)} /><DateField label="Filter by date" value={date} onChange={setDate} /></div></div>
          <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-auto">
            {filteredOpen.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => load(a.attendanceId)}
                  className={`w-full px-4 py-3 text-left text-sm ${selected === a.attendanceId ? "bg-teal-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{a.name}</span>
                    <Badge tone={a.severity === "high" ? "rose" : "amber"}>{a.type.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.date} · {departments.find((d) => d.id === a.departmentId)?.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{a.message}</p>
                </button>
              </li>
            ))}
            {filteredOpen.length === 0 && <li className="p-6 text-sm text-slate-500">No matching verification records.</li>}
          </ul>
        </Card>
        <Card className="p-5 lg:col-span-3">
          {!record && <p className="text-sm text-slate-500">Select a flagged record to correct punches, minutes, or notes.</p>}
          {record && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{record.name}</h2>
                <p className="text-sm text-slate-500">
                  {record.personId} · {record.date} · {record.timetable}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Check-in">
                  <Input
                    value={draft.checkIn ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, checkIn: e.target.value }))}
                  />
                </Field>
                <Field label="Check-out">
                  <Input
                    value={draft.checkOut ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, checkOut: e.target.value }))}
                  />
                </Field>
                <Field label="Work minutes">
                  <Input
                    type="number"
                    value={draft.work ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, work: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Attended minutes">
                  <Input
                    type="number"
                    value={draft.attended ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, attended: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Late minutes">
                  <Input
                    type="number"
                    value={draft.late ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, late: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={draft.status ?? record.status}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, status: e.target.value as AttendanceFinal["status"] }))
                    }
                  >
                    {["Attended", "Absent", "LV", "Holiday", "Weekend"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Explanatory note">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this correction was made" />
              </Field>
              {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
              <div className="flex gap-2">
                <Button
                  disabled={saving}
                  onClick={() => void saveRecord(draft)}
                >
                  {saving ? "Saving…" : "Save to verified records"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={() => void saveRecord({ status: "LV", leave: 480, attended: 0, work: 0 }, note || "Marked as leave")}
                >
                  Convert to leave (LV)
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
