import { useMemo, useState } from "react";
import { departments, useApp } from "../data/store";
import { computeKpis, workingDaysInRange } from "../lib/kpis";
import { bandColor, formatMinutes } from "../lib/utils";
import { Badge, Button, Card, MonthField, PageHeader } from "../components/ui";
import { exportWorkbook } from "../lib/excel";

export function MonthlyReportPage() {
  const { scopedFinals, scopedEmployees, holidays } = useApp();
  const people = scopedEmployees(); const rows = scopedFinals();
  const months = [...new Set(rows.map(r => r.date.slice(0,7)))].sort();
  const [month, setMonth] = useState(months[months.length-1] ?? "2026-09");
  const [year, mon] = month.split("-").map(Number); const start = `${month}-01`; const end = new Date(year, mon, 0).toISOString().slice(0,10); const workDays = workingDaysInRange(start, end, holidays);
  const summary = useMemo(() => people.map(emp => { const rec=rows.filter(r=>r.personId===emp.personId && r.date>=start && r.date<=end); const k=computeKpis(rec, workDays.length); return {Name:emp.name,"Person ID":emp.personId,Department:departments.find(d=>d.id===emp.departmentId)?.name??"","Working days":k.workingDays,Present:k.present,Late:k.lateDays,"Attendance %":Number(k.attendancePct.toFixed(1)),"Punctuality %":Number(k.punctualityPct.toFixed(1)),Band:k.band,"Late minutes":rec.reduce((s,r)=>s+r.late,0)}; }), [people, rows, start, end, workDays.length]);
  return <div><PageHeader title="Monthly report" subtitle="Choose the reporting month directly with the calendar-style month selector." actions={<Button onClick={()=>exportWorkbook(`RICA_monthly_${month}.xlsx`, summary)}>Export Excel</Button>} /><div className="mb-4 max-w-xs"><MonthField label="Reporting month" value={month} onChange={setMonth}/></div><Card className="overflow-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{Object.keys(summary[0] ?? {Employee:""}).map(h=><th key={h} className="px-4 py-2">{h}</th>)}</tr></thead><tbody>{summary.map(r=><tr key={r["Person ID"]} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{r.Name}</td><td className="px-4 py-3 font-mono text-xs">{r["Person ID"]}</td><td className="px-4 py-3">{r.Department}</td><td className="px-4 py-3">{r["Working days"]}</td><td className="px-4 py-3">{r.Present}</td><td className="px-4 py-3">{r.Late}</td><td className="px-4 py-3">{r["Attendance %"]}%</td><td className="px-4 py-3">{r["Punctuality %"]}%</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${bandColor(r.Band)}`}>{r.Band}</span></td><td className="px-4 py-3">{formatMinutes(r["Late minutes"])}</td></tr>)}</tbody></table></Card><div className="mt-4 flex flex-wrap gap-2"><Badge tone="emerald">≥95% Excellent</Badge><Badge tone="sky">85–94% Good</Badge><Badge tone="amber">70–84% Needs improvement</Badge><Badge tone="rose">&lt;70% Warning</Badge></div></div>;
}
