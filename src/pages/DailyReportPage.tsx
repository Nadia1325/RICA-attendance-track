import { useMemo, useState } from "react";
import { departments, useApp } from "../data/store";
import { exportWorkbook } from "../lib/excel";
import { Button, Card, DateField, PageHeader } from "../components/ui";

export function DailyReportPage() {
  const { scopedFinals } = useApp();
  const rows = scopedFinals();
  const dates = [...new Set(rows.map((r) => r.date))].sort();
  const [date, setDate] = useState(dates[dates.length - 1] ?? "2026-09-24");
  const report = useMemo(() => rows.filter((r) => r.date === date).map((r, i) => ({ No: i + 1, Name: r.name, "Person ID": r.personId, Department: departments.find((d) => d.id === r.departmentId)?.name ?? "", Date: r.date, Week: r.week, Timetable: r.timetable, "Check-in": r.checkIn || "—", "Check-out": r.checkOut || "—", Status: r.status })), [rows, date]);
  return <div><PageHeader title="Daily report" subtitle="Select any date using the modern calendar control, review the scoped records, and export the report." actions={<Button onClick={() => exportWorkbook(`RICA_daily_${date}.xlsx`, report)}>Export Excel</Button>} /><div className="mb-4 max-w-xs"><DateField label="Report date" value={date} onChange={setDate} /></div><Card className="overflow-auto"><table className="min-w-[1000px] w-full text-left text-sm"><thead className="bg-teal-950 text-xs uppercase tracking-wide text-teal-50"><tr>{["No.","Name","Person ID","Department","Date","Week","Timetable","Check-in","Check-out","Status"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{report.map(r=><tr key={`${r["Person ID"]}-${r.Date}`} className="border-t border-slate-100"><td className="px-4 py-2">{r.No}</td><td className="px-4 py-2 font-medium">{r.Name}</td><td className="px-4 py-2 font-mono text-xs">{r["Person ID"]}</td><td className="px-4 py-2">{r.Department}</td><td className="px-4 py-2">{r.Date}</td><td className="px-4 py-2">{r.Week}</td><td className="px-4 py-2">{r.Timetable}</td><td className="px-4 py-2">{r["Check-in"]}</td><td className="px-4 py-2">{r["Check-out"]}</td><td className="px-4 py-2">{r.Status}</td></tr>)}{report.length===0&&<tr><td colSpan={10} className="px-4 py-10 text-center text-slate-500">No records for this date.</td></tr>}</tbody></table></Card></div>;
}
