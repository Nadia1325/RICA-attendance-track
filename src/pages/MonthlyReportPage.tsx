import { useEffect, useMemo, useState } from "react";
import { useApp } from "../data/store";
import { computeKpis, workingDaysInRange } from "../lib/kpis";
import { bandColor, formatMinutes } from "../lib/utils";
import { Badge, Button, Card, MonthField, PageHeader } from "../components/ui";
import { exportWorkbook } from "../lib/excel";
import { apiConfigured, apiRequest } from "../lib/api";
import type { AttendanceFinal } from "../types";

type ApiAttendanceRow = Record<string, unknown>;

export function MonthlyReportPage() {
  const { scopedFinals, scopedEmployees, holidays, departments, currentUser } = useApp();
  const people = scopedEmployees();
  const rows = scopedFinals();
  const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))].sort();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(apiConfigured ? currentMonth : months[months.length - 1] ?? currentMonth);
  const [remoteRows, setRemoteRows] = useState<ApiAttendanceRow[] | null>(null);
  const [reportError, setReportError] = useState("");
  const [year, mon] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end = new Date(year, mon, 0).toISOString().slice(0, 10);
  const workDays = workingDaysInRange(start, end, holidays);

  useEffect(() => {
    if (!apiConfigured || !currentUser || !year || !mon) return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    let active = true;
    setRemoteRows(null);
    setReportError("");
    void apiRequest<{ rows?: ApiAttendanceRow[] }>(`/api/reports/monthly?year=${year}&month=${mon}`, {}, token)
      .then((payload) => { if (active) setRemoteRows(payload.rows ?? []); })
      .catch((error) => { if (active) { setRemoteRows(null); setReportError(error instanceof Error ? error.message : "Unable to load the monthly report."); } });
    return () => { active = false; };
  }, [month, year, mon, currentUser]);

  const summary = useMemo(() => people.map((emp) => {
    const rec: AttendanceFinal[] = apiConfigured && remoteRows !== null
      ? remoteRows.filter((r) => String(r.person_id ?? "") === emp.personId).map((r, index) => {
          const rawStatus = String(r.status ?? "").toUpperCase();
          const status: AttendanceFinal["status"] = rawStatus === "A" ? "Absent" : rawStatus === "LV" ? "LV" : rawStatus === "#" ? "Weekend" : rawStatus === "HOLIDAY" ? "Holiday" : "Attended";
          return { id: String(r.id ?? `${emp.personId}-${index}`), personId: emp.personId, name: emp.name, departmentId: emp.departmentId, unitId: emp.unitId, date: String(r.date ?? ""), week: String(r.week ?? ""), timetable: String(r.timetable ?? ""), checkIn: String(r.check_in ?? ""), checkOut: String(r.check_out ?? ""), work: Number(r.work_min ?? 0), ot: Number(r.ot_min ?? 0), attended: Number(r.attended_min ?? 0), late: Number(r.late_min ?? 0), early: Number(r.early_min ?? 0), absent: Number(r.absent_min ?? 0), leave: Number(r.leave_min ?? 0), status, notes: String(r.notes ?? ""), verified: Boolean(r.verified_at) };
        })
      : rows.filter((r) => r.personId === emp.personId && r.date >= start && r.date <= end);
    const k = computeKpis(rec, workDays.length);
    return { Name: emp.name, "Person ID": emp.personId, Department: departments.find((d) => d.id === emp.departmentId)?.name ?? "", "Working days": k.workingDays, Present: k.present, Late: k.lateDays, "Attendance %": Number(k.attendancePct.toFixed(1)), "Punctuality %": Number(k.punctualityPct.toFixed(1)), Band: k.band, "Late minutes": rec.reduce((sum, r) => sum + r.late, 0) };
  }), [people, rows, start, end, workDays.length, departments, remoteRows]);

  return <div className="min-w-0">
    <PageHeader title="Monthly report" subtitle="Choose the reporting month and export the department scoped summary." actions={<Button onClick={() => exportWorkbook(`RICA_monthly_${month}.xlsx`, summary)}>Export Excel</Button>} />
    {reportError && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{reportError}</p>}
    <div className="mb-4 max-w-xs"><MonthField label="Reporting month" value={month} onChange={setMonth} /></div>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{Object.keys(summary[0] ?? { Employee: "" }).map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr></thead>
      <tbody>{summary.map((r) => <tr key={r["Person ID"]} className="border-t border-slate-100"><td className="px-3 py-3 font-medium">{r.Name}</td><td className="px-3 py-3 font-mono text-xs">{r["Person ID"]}</td><td className="px-3 py-3">{r.Department}</td><td className="px-3 py-3">{r["Working days"]}</td><td className="px-3 py-3">{r.Present}</td><td className="px-3 py-3">{r.Late}</td><td className="px-3 py-3">{r["Attendance %"]}%</td><td className="px-3 py-3">{r["Punctuality %"]}%</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(r.Band)}`}>{r.Band}</span></td><td className="px-3 py-3">{formatMinutes(r["Late minutes"])}</td></tr>)}{summary.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No employee records for this month.</td></tr>}</tbody>
    </table></div></Card>
    <div className="mt-4 flex flex-wrap gap-2"><Badge tone="emerald">≥95% Excellent</Badge><Badge tone="sky">85–94% Good</Badge><Badge tone="amber">70–84% Needs improvement</Badge><Badge tone="rose">&lt;70% Warning</Badge></div>
  </div>;
}
