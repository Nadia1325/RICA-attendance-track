import { useMemo, useState } from "react";
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
import { departments, useApp } from "../data/store";
import { computeKpis, workingDaysInRange } from "../lib/kpis";
import { bandColor } from "../lib/utils";
import { Card, PageHeader, Select, Stat } from "../components/ui";

export function PerformancePage() {
  const { scopedFinals, scopedEmployees, holidays } = useApp();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const all = scopedFinals();
  const range =
    period === "year"
      ? { start: "2026-01-01", end: "2026-09-24" }
      : period === "quarter"
        ? { start: "2026-07-01", end: "2026-09-24" }
        : { start: "2026-09-01", end: "2026-09-24" };
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

  const avgAtt = table.length ? table.reduce((s, r) => s + r.attendancePct, 0) / table.length : 0;
  const avgPun = table.length ? table.reduce((s, r) => s + r.punctualityPct, 0) / table.length : 0;
  const warnings = table.filter((r) => r.band === "Warning").length;
  const chart = departments.map((d) => {
    const subset = table.filter((t) => t.emp.departmentId === d.id);
    const att = subset.length ? subset.reduce((s, r) => s + r.attendancePct, 0) / subset.length : 0;
    return { name: d.code, attendance: Number(att.toFixed(1)) };
  });

  return (
    <div>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Avg attendance" value={`${avgAtt.toFixed(1)}%`} />
        <Stat label="Avg punctuality" value={`${avgPun.toFixed(1)}%`} />
        <Stat label="Warning band" value={warnings} hint="Below 70% attendance" accent="text-rose-700" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Attendance KPI</h2><p className="text-xs text-slate-500">Average attendance rate</p>
          <div className="relative mx-auto mt-3 h-56 w-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value:Number(avgAtt.toFixed(1))},{value:Number((100-avgAtt).toFixed(1))}]} dataKey="value" innerRadius={65} outerRadius={88} startAngle={90} endAngle={-270}>{[0,1].map(i=><Cell key={i} fill={i===0?"#0f766e":"#e2e8f0"}/>)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold">{avgAtt.toFixed(1)}%</span><span className="text-xs text-slate-500">attendance</span></div></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Punctuality KPI</h2><p className="text-xs text-slate-500">Average punctuality rate</p>
          <div className="relative mx-auto mt-3 h-56 w-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value:Number(avgPun.toFixed(1))},{value:Number((100-avgPun).toFixed(1))}]} dataKey="value" innerRadius={65} outerRadius={88} startAngle={90} endAngle={-270}>{[0,1].map(i=><Cell key={i} fill={i===0?"#0284c7":"#e2e8f0"}/>)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold">{avgPun.toFixed(1)}%</span><span className="text-xs text-slate-500">punctuality</span></div></div>
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
      <Card className="mt-6 overflow-auto">
        <table className="w-full text-left text-sm">
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
            {table.map((r) => (
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
        </table>
      </Card>
    </div>
  );
}
