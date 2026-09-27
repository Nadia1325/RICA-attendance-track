import type { AttendanceFinal, Holiday } from "../types";
import { performanceBand } from "./utils";

function isWeekend(date: string) {
  const d = new Date(`${date}T00:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function workingDaysInRange(
  start: string,
  end: string,
  holidays: Holiday[],
) {
  const holidaySet = new Set(holidays.map((h) => h.date));
  const dates: string[] = [];
  const cur = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cur <= last) {
    const iso = cur.toISOString().slice(0, 10);
    if (!isWeekend(iso) && !holidaySet.has(iso)) dates.push(iso);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function computeKpis(
  records: AttendanceFinal[],
  workingDays: number,
) {
  const present = records.filter((r) => r.status === "Attended").length;
  const punctual = records.filter(
    (r) => r.status === "Attended" && r.late === 0,
  ).length;
  const attendancePct = workingDays ? (present / workingDays) * 100 : 0;
  const punctualityPct = present ? (punctual / present) * 100 : 0;
  return {
    present,
    workingDays,
    lateDays: present - punctual,
    attendancePct,
    punctualityPct,
    band: performanceBand(attendancePct),
  };
}
