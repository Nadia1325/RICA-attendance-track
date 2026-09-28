import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../data/store";
import { computeKpis, workingDaysInRange } from "../lib/kpis";
import { bandColor } from "../lib/utils";
import { Card, PageHeader, Select, Stat } from "../components/ui";
import { apiConfigured, apiRequest } from "../lib/api";

type RemoteKpi = {
  summary: { average_attendance_pct: number; average_punctuality_pct: number };
  employees: { employee_id: string; person_id: string; name: string; department: string; working_days: number; days_present: number; days_late: number; attendance_pct: number; punctuality_pct: number; rating: string }[];
};
type RemotePeriodRow = { id?: string; person_id?: string; name?: string; department?: string; date?: string; check_in?: string; check_out?: string; status?: string; late_min?: number };

export function PerformancePage() {
  const { scopedFinals, scopedEmployees, holidays, departments, currentUser } = useApp();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [remote, setRemote] = useState<RemoteKpi | null>(null);
  const [periodRows, setPeriodRows] = useState<RemotePeriodRow[] | null>(null);
  const [reportError, setReportError] = useState("");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  useEffect(() => {
    if (!apiConfigured || !currentUser) return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    const periodQuery = period === "month" ? `year=${year}&month=${month}` : period === "quarter" ? `year=${year}&quarter=${quarter}` : `year=${year}`;
    const reportPath = period === "month" ? `/api/reports/monthly?${periodQuery}` : period === "quarter" ? `/api/reports/quarterly?${periodQuery}` : `/api/reports/yearly?${periodQuery}`;
    let active = true;
    setRemote(null);
    setPeriodRows(null);
    setReportError("");
    void Promise.all([
      apiRequest<RemoteKpi>(`/api/reports/kpis?${periodQuery}`, {}, token),
      apiRequest<{ rows?: RemotePeriodRow[] }>(reportPath, {}, token),
    ])
      .then(([data, report]) => { if (active) { setRemote(data); setPeriodRows(report.rows ?? []); } })
      .catch((error) => { if (active) { setRemote(null); setReportError(error instanceof Error ? error.message : "Unable to load KPI report."); } });
    return () => { active = false; };
  }, [period, year, month, quarter, currentUser]);
  const all = scopedFinals();
  const today = now.toISOString().slice(0, 10);
  const startMonth = period === "year" ? 1 : period === "quarter" ? (quarter - 1) * 3 + 1 : month;
  const range = { start: `${year}-${String(startMonth).padStart(2, "0")}-01`, end: today };
  const people = scopedEmployees();
  const rows = all.filter((r) => r.date >= range.start && r.date <= range.end);
  const imported = [...new Set(rows.map((r) => r.date))].sort();
  const workDays = workingDaysInRange(
    imported[0] ?? range.start,
    imported[imported.length - 1] ?? range.end,
    holidays,
  );

  const table = useMemo(
    () =>
      people
        .map((emp) => {
          const rec = rows.filter((r) => r.personId === emp.personId);
          const k = computeKpis(rec, workDays.length);
          return {
            emp,
            ...k,
            dept: departments.find((d) => d.id === emp.departmentId)?.name ?? "",
          };
        })
        .sort((a, b) => b.attendancePct - a.attendancePct),
    [people, rows, workDays.length],
  );

  const avgAtt = remote?.summary.average_attendance_pct ?? (table.length ? table.reduce((s, r) => s + r.attendancePct, 0) / table.length : 0);
  const avgPun = remote?.summary.average_punctuality_pct ?? (table.length ? table.reduce((s, r) => s + r.punctualityPct, 0) / table.length : 0);
  const warnings = remote ? remote.employees.filter((r) => r.rating === "Warning").length : table.filter((r) => r.band === "Warning").length;
  const chart = departments.map((d) => {
    if (remote) {
      const subset = remote.employees.filter((employee) => employee.department === d.name);
      return { name: d.code, attendance: subset.length ? Number((subset.reduce((sum, employee) => sum + employee.attendance_pct, 0) / subset.length).toFixed(1)) : 0 };
    }
    const subset = table.filter((t) => t.emp.departmentId === d.id);
    const att = subset.length ? subset.reduce((s, r) => s + r.attendancePct, 0) / subset.length : 0;
    return { name: d.code, attendance: Number(att.toFixed(1)) };
  });

  return (
    <div className="min-w-0">
      <PageHeader
        title="Performance KPIs"
        subtitle="Track attendance and punctuality over monthly, quarterly, and yearly windows."
        actions={
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="w-40"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </Select>
        }
      />
      {reportError && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{reportError}</p>}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Avg attendance" value={`${avgAtt.toFixed(1)}%`} />
        <Stat label="Avg punctuality" value={`${avgPun.toFixed(1)}%`} />
        <Stat label="Warning band" value={warnings} hint="Below 70% attendance" accent="text-rose-700" />
      </div>
      <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0 p-4 sm:p-5">
          <h2 className="font-semibold">Attendance KPI</h2><p className="text-xs text-slate-500">Average attendance rate</p>
          <div className="relative mx-auto mt-3 h-48 w-48 max-w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value:Number(avgAtt.toFixed(1))},{value:Number((100-avgAtt).toFixed(1))}]} dataKey="value" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270}>{[0,1].map(i=><Cell key={i} fill={i===0?"#0f766e":"#e2e8f0"}/>)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold">{avgAtt.toFixed(1)}%</span><span className="text-xs text-slate-500">attendance</span></div></div>
        </Card>
        <Card className="min-w-0 p-4 sm:p-5">
          <h2 className="font-semibold">Punctuality KPI</h2><p className="text-xs text-slate-500">Average punctuality rate</p>
          <div className="relative mx-auto mt-3 h-48 w-48 max-w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value:Number(avgPun.toFixed(1))},{value:Number((100-avgPun).toFixed(1))}]} dataKey="value" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270}>{[0,1].map(i=><Cell key={i} fill={i===0?"#0284c7":"#e2e8f0"}/>)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold">{avgPun.toFixed(1)}%</span><span className="text-xs text-slate-500">punctuality</span></div></div>
        </Card>
      </div>
      <Card className="mt-6 p-5">
        <h2 className="mb-4 font-semibold">Department attendance %</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="attendance" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="mt-5 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["Employee", "Department", "Present", "Attendance %", "Punctuality %", "Band"].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {remote ? remote.employees.map((r) => (
              <tr key={r.employee_id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.department}</td>
                <td className="px-4 py-3">{r.days_present}/{r.working_days}</td>
                <td className="px-4 py-3">{r.attendance_pct.toFixed(1)}%</td>
                <td className="px-4 py-3">{r.punctuality_pct.toFixed(1)}%</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(r.rating as "Excellent" | "Good" | "Needs Improvement" | "Warning")}`}>{r.rating}</span></td>
              </tr>
            )) : table.map((r) => (
              <tr key={r.emp.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.emp.name}</td>
                <td className="px-4 py-3">{r.dept}</td>
                <td className="px-4 py-3">
                  {r.present}/{r.workingDays}
                </td>
                <td className="px-4 py-3">{r.attendancePct.toFixed(1)}%</td>
                <td className="px-4 py-3">{r.punctualityPct.toFixed(1)}%</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(r.band)}`}>
                    {r.band}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Card>
      {apiConfigured && <Card className="mt-5 min-w-0 overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3"><h2 className="font-semibold">Attendance records for this {period}</h2><p className="mt-1 text-xs text-slate-500">Loaded from the matching RICA period report endpoint.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Date", "Employee", "Person ID", "Department", "Check-in", "Check-out", "Status", "Late minutes"].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr></thead><tbody>{(periodRows ?? []).map((row, index) => <tr key={row.id ?? `${row.person_id}-${row.date}-${index}`} className="border-t border-slate-100"><td className="whitespace-nowrap px-3 py-2">{row.date}</td><td className="px-3 py-2 font-medium">{row.name}</td><td className="px-3 py-2 font-mono text-xs">{row.person_id}</td><td className="px-3 py-2">{row.department}</td><td className="px-3 py-2">{row.check_in || "—"}</td><td className="px-3 py-2">{row.check_out || "—"}</td><td className="px-3 py-2">{row.status}</td><td className="px-3 py-2">{row.late_min ?? 0}</td></tr>)}{periodRows?.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No attendance records in this period.</td></tr>}</tbody></table></div>
      </Card>}
    </div>
  );
}
