import { useEffect, useMemo, useState } from "react";
import { useApp } from "../data/store";
import { exportWorkbook } from "../lib/excel";
import { apiConfigured, apiRequest } from "../lib/api";
import { Button, Card, DateField, PageHeader } from "../components/ui";

type ReportRow = { No: number; Name: string; "Person ID": string; Department: string; Date: string; Week: string; Timetable: string; "Check-in": string; "Check-out": string; Status: string };

export function DailyReportPage() {
  const { scopedFinals, departments, currentUser } = useApp();
  const rows = scopedFinals();
  const dates = [...new Set(rows.map((r) => r.date))].sort();
  const [date, setDate] = useState(dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10));
  const [remoteRows, setRemoteRows] = useState<Record<string, unknown>[] | null>(null);
  useEffect(() => {
    if (!apiConfigured || !currentUser || !date) return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    let active = true;
    void apiRequest<{ rows?: Record<string, unknown>[] }>(`/api/reports/daily?date=${encodeURIComponent(date)}`, {}, token)
      .then((payload) => { if (active) setRemoteRows(payload.rows ?? []); })
      .catch(() => { if (active) setRemoteRows([]); });
    return () => { active = false; };
  }, [date, currentUser]);
  const report = useMemo<ReportRow[]>(() => apiConfigured && remoteRows !== null
    ? remoteRows.map((r, i) => ({ No: Number(r["No."] ?? i + 1), Name: String(r.Name ?? ""), "Person ID": String(r.person_id ?? ""), Department: String(r.Department ?? ""), Date: String(r.Date ?? date), Week: String(r.Week ?? ""), Timetable: String(r.Timetable ?? ""), "Check-in": String(r["Check-in"] ?? "—"), "Check-out": String(r["Check-out"] ?? "—"), Status: String(r.status ?? "") }))
    : rows.filter((r) => r.date === date).map((r, i) => ({ No: i + 1, Name: r.name, "Person ID": r.personId, Department: departments.find((d) => d.id === r.departmentId)?.name ?? "", Date: r.date, Week: r.week, Timetable: r.timetable, "Check-in": r.checkIn || "—", "Check-out": r.checkOut || "—", Status: r.status })), [rows, date, departments, remoteRows]);
  return <div className="min-w-0"><PageHeader title="Daily report" subtitle="Select a date, review the scoped records, and export the report." actions={<Button onClick={() => exportWorkbook(`RICA_daily_${date}.xlsx`, report)}>Export Excel</Button>} /><div className="mb-4 max-w-xs"><DateField label="Report date" value={date} onChange={setDate} /></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-teal-950 text-xs uppercase tracking-wide text-teal-50"><tr>{["No.","Name","Person ID","Department","Date","Week","Timetable","Check-in","Check-out","Status"].map((h)=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{report.map((r)=><tr key={`${r["Person ID"]}-${r.Date}`} className="border-t border-slate-100"><td className="px-4 py-2">{r.No}</td><td className="px-4 py-2 font-medium">{r.Name}</td><td className="px-4 py-2 font-mono text-xs">{r["Person ID"]}</td><td className="px-4 py-2">{r.Department}</td><td className="px-4 py-2">{r.Date}</td><td className="px-4 py-2">{r.Week}</td><td className="px-4 py-2">{r.Timetable}</td><td className="px-4 py-2">{r["Check-in"]}</td><td className="px-4 py-2">{r["Check-out"]}</td><td className="px-4 py-2">{r.Status}</td></tr>)}{report.length===0&&<tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No records for this date.</td></tr>}</tbody></table></div></Card></div>;
}
