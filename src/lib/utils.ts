import type { PerformanceBand, Role } from "../types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatMinutes(mins: number) {
  if (!Number.isFinite(mins)) return "—";
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h ${String(m).padStart(2, "0")}m`;
}

export function performanceBand(pct: number): PerformanceBand {
  if (pct >= 95) return "Excellent";
  if (pct >= 85) return "Good";
  if (pct >= 70) return "Needs Improvement";
  return "Warning";
}

export function bandColor(band: PerformanceBand) {
  switch (band) {
    case "Excellent":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "Good":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "Needs Improvement":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    default:
      return "bg-rose-50 text-rose-800 ring-rose-200";
  }
}

export function roleLabel(role: Role) {
  switch (role) {
    case "admin":
      return "Admin";
    case "hod":
      return "Head of Department";
    case "hou":
      return "Head of Office/Unit";
    case "director":
      return "Director";
  }
}

export const RAW_HEADERS = [
  "No.",
  "Person ID",
  "Name",
  "Department",
  "Position",
  "Gender",
  "Date",
  "Week",
  "Timetable",
  "Check-in",
  "Check-out",
  "Work",
  "OT",
  "Attended",
  "Late",
  "Early",
  "Absent",
  "Leave",
  "Status",
  "Records",
] as const;

export const DIRECTOR_HEADERS = [
  "No.",
  "Name",
  "Department",
  "Date",
  "Week",
  "Timetable",
  "Check-in",
  "Check-out",
] as const;
