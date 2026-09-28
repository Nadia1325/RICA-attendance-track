import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "../data/store";
import { computeKpis, workingDaysInRange } from "../lib/kpis";
import { bandColor, formatMinutes } from "../lib/utils";
import { Badge, Button, Card, DateField, PageHeader, Stat } from "../components/ui";
import { apiConfigured, apiRequest } from "../lib/api";

type DepartmentSummary = {
  employee_count: number;
  today: { date: string; status_counts: { present: number; absent: number; leave: number; weekend_or_holiday: number; unrecorded: number } };
  kpi_summary: { average_attendance_pct: number; average_punctuality_pct: number };
};

export function DashboardPage() {
  const { currentUser, scopedFinals, scopedAnomalies, batches, holidays, departments } = useApp();
  const navigate = useNavigate();
  const records = scopedFinals();
  const flags = scopedAnomalies().filter((a) => !a.resolved);
  const [today, setToday] = useState(new Date().toISOString().slice(0, 10));
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary | null>(null);
  const todayRows = records.filter((r) => r.date === today);
  useEffect(() => {
    if (!apiConfigured || currentUser?.role !== "hod") return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    const periodStart = `${today.slice(0, 7)}-01`;
    let active = true;
    void apiRequest<DepartmentSummary>(`/api/reports/my-department?from=${periodStart}&to=${today}`, {}, token)
      .then((summary) => { if (active) setDepartmentSummary(summary); })
      .catch(() => { if (active) setDepartmentSummary(null); });
    return () => { active = false; };
  }, [today, currentUser]);
  const serverToday = apiConfigured && currentUser?.role === "hod" && departmentSummary?.today.date === today ? departmentSummary : null;
  const present = serverToday?.today.status_counts.present ?? todayRows.filter((r) => r.status === "Attended").length;
  const late = todayRows.filter((r) => r.late > 0 && r.status === "Attended").length;
  const absent = serverToday?.today.status_counts.absent ?? todayRows.filter((r) => r.status === "Absent").length;
  const onLeave = serverToday?.today.status_counts.leave ?? todayRows.filter((r) => r.status === "LV").length;
  const employeeTotal = serverToday?.employee_count ?? todayRows.length;
  const totalToday = Math.max(employeeTotal, 1);

  const trend = useMemo(() => {
    const dates = [...new Set(records.map((r) => r.date))].sort();
    return dates.map((date) => {
      const day = records.filter((r) => r.date === date);
      const total = Math.max(day.length, 1);
      const attended = day.filter((r) => r.status === "Attended").length;
      const lateCount = day.filter((r) => r.late > 0 && r.status === "Attended").length;
      const absentCount = day.filter((r) => r.status === "Absent").length;
      return { date: date.slice(5), presentPct: Number(((attended / total) * 100).toFixed(1)), latePct: Number(((lateCount / total) * 100).toFixed(1)), absentPct: Number(((absentCount / total) * 100).toFixed(1)) };
    });
  }, [records]);

  const working = workingDaysInRange("2026-09-21", "2026-09-24", holidays).length;
  const localKpis = computeKpis(records, Math.max(working * new Set(records.map((r) => r.personId)).size, 1));
  const kpis = currentUser?.role === "hod" && departmentSummary ? {
    ...localKpis,
    attendancePct: departmentSummary.kpi_summary.average_attendance_pct,
    punctualityPct: departmentSummary.kpi_summary.average_punctuality_pct,
  } : localKpis;
  const departmentTracking = departments.map((d) => {
    const rows = todayRows.filter((r) => r.departmentId === d.id);
    const attended = rows.filter((r) => r.status === "Attended").length;
    const pct = rows.length ? Math.round((attended / rows.length) * 100) : 0;
    const band = pct >= 95 ? "Excellent" : pct >= 85 ? "Good" : pct >= 70 ? "Needs Improvement" : "Warning";
    return { ...d, attended, total: rows.length, pct, band };
  });
  const bandFill = (band: string) => band === "Excellent" ? "#059669" : band === "Good" ? "#0284c7" : band === "Needs Improvement" ? "#d97706" : "#e11d48";
  const trackingPct = Math.round(todayRows.filter((r) => r.status === "Attended").length / totalToday * 100);
  const donutData = [{ name: "Attendance", value: trackingPct }, { name: "Remaining", value: 100 - trackingPct }];

  return <div className="min-w-0">
    <PageHeader title={`Good morning, ${currentUser?.name.split(" ")[0]}`} subtitle="Live operational view of fingerprint attendance across RICA offices." actions={<div className="flex flex-wrap items-end gap-2"><DateField label="Dashboard date" value={today} onChange={setToday}/><Button variant="secondary" onClick={() => navigate("/reports/daily")}>Director report</Button>{currentUser?.role === "admin" && <Button onClick={() => navigate("/upload")}>Upload export</Button>}</div>} />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Present today" value={`${present}/${employeeTotal}`} hint={`${Math.round((present / totalToday) * 100)}% of scoped employees`} accent="text-teal-800" />
      <Stat label="Late arrivals" value={late} hint={`${Math.round((late / totalToday) * 100)}% of scoped employees · after grace period`} accent="text-amber-700" />
      <Stat label="Absent" value={absent} hint={`${Math.round((absent / totalToday) * 100)}% of scoped employees · no valid punch`} accent="text-rose-700" />
      <Stat label="On leave" value={onLeave} hint={`${onLeave} employees on leave`} />
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-3">
      <Card className="p-5 xl:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold text-slate-900">Attendance trend</h2><p className="text-xs text-slate-500">Daily attendance, late and absence rates</p></div><Badge tone="teal">All graph values are %</Badge></div>
        <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} /><stop offset="95%" stopColor="#0f766e" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} /><Tooltip formatter={(value) => `${value}%`} /><Area type="monotone" dataKey="presentPct" name="Attendance" stroke="#0f766e" fill="url(#p)" /><Area type="monotone" dataKey="latePct" name="Late" stroke="#d97706" fill="transparent" /><Area type="monotone" dataKey="absentPct" name="Absent" stroke="#e11d48" fill="transparent" /></AreaChart></ResponsiveContainer></div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-slate-900">Institution KPIs</h2><p className="mt-1 text-xs text-slate-500">Organization-wide performance percentages</p>
        <div className="mt-5 space-y-4"><div><div className="flex justify-between text-sm"><span>Attendance</span><span className="font-semibold">{kpis.attendancePct.toFixed(1)}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${Math.min(100, kpis.attendancePct)}%` }} /></div></div><div><div className="flex justify-between text-sm"><span>Punctuality</span><span className="font-semibold">{kpis.punctualityPct.toFixed(1)}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-600" style={{ width: `${Math.min(100, kpis.punctualityPct)}%` }} /></div></div><div className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${bandColor(kpis.band)}`}>Band: {kpis.band}</div><p className="text-xs text-slate-500">Department circles: ≥95% Excellent · 85–94% Good · 70–84% Needs Improvement · &lt;70% Warning.</p></div>
      </Card>
    </div>

    <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
      <Card className="min-w-0 p-4 sm:p-5 xl:col-span-2">
        <div className="mb-3 flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold">Department tracking</h2><p className="text-xs leading-5 text-slate-500">Circular organization attendance rate with department breakdown</p></div><Badge tone="teal">{trackingPct}%</Badge></div>
        <div className="grid min-w-0 items-center gap-5 xl:grid-cols-[190px_minmax(0,1fr)]">
          <div className="relative mx-auto h-44 w-44 max-w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donutData} dataKey="value" innerRadius={56} outerRadius={76} paddingAngle={2} startAngle={90} endAngle={-270}>{donutData.map((_, i) => <Cell key={i} fill={i === 0 ? "#0f766e" : "#e2e8f0"} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold text-slate-900">{trackingPct}%</span><span className="text-[11px] text-slate-500">attendance</span></div></div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {departmentTracking.map((d) => {
              const data = [{ name: "Performance", value: d.pct }, { name: "Remaining", value: 100 - d.pct }];
              const fill = bandFill(d.band);
              return <div key={d.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2">
                <div className="relative h-14 w-14 shrink-0">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius={18} outerRadius={25} paddingAngle={2} startAngle={90} endAngle={-270}>{data.map((_, i) => <Cell key={i} fill={i === 0 ? fill : "#e2e8f0"} />)}</Pie></PieChart></ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">{d.pct}%</div>
                </div>
                <div className="min-w-0 flex-1"><p className="break-words text-xs font-semibold leading-4 text-slate-800">{d.code} · {d.name}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{d.attended}/{d.total} present</p><span className="mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ring-1" style={{ color: fill, backgroundColor: `${fill}12`, borderColor: `${fill}40` }}>{d.band}</span></div>
              </div>;
            })}
          </div>
        </div>
      </Card>

      <Card className="p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Open anomalies</h2><Button variant="ghost" onClick={() => navigate("/verification")}>Review queue</Button></div><div className="space-y-3">{flags.slice(0, 5).map((a) => <div key={a.id} className="rounded-xl border border-slate-100 p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{a.name}</p><Badge tone={a.severity === "high" ? "rose" : "amber"}>{a.severity}</Badge></div><p className="mt-1 text-xs text-slate-500">{a.date} · {a.message}</p></div>)}{flags.length === 0 && <p className="text-sm text-slate-500">No open flags in your scope.</p>}</div><div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold">Recent batches</h3><ul className="mt-2 space-y-2 text-sm">{batches.slice(0, 3).map((b) => <li key={b.id} className="flex justify-between"><span className="text-slate-700">{b.id}</span><span className="text-slate-500">{b.rowCount} rows</span></li>)}</ul></div><p className="mt-4 text-xs text-slate-400">Late minutes today (sample): {formatMinutes(todayRows.reduce((s, r) => s + r.late, 0))}</p></Card>
    </div>
  </div>;
}
