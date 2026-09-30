// src/pages/MonthlyReportPage/utils.ts
import type { AttendanceFinal, Employee } from "../../types/types";

/**
 * Raw API row from /api/reports/monthly.
 * Fields come as snake_case from the backend.
 */
export interface ApiAttendanceRow {
  id?: string | number;
  person_id?: string | number;
  name?: string;
  department?: string;
  department_id?: string;
  date?: string;
  week?: string;
  timetable?: string;
  check_in?: string;
  check_out?: string;
  work_min?: number | string;
  ot_min?: number | string;
  attended_min?: number | string;
  late_min?: number | string;
  early_min?: number | string;
  absent_min?: number | string;
  leave_min?: number | string;
  status?: string;
  notes?: string;
  verified_at?: string | null;
  [key: string]: unknown; // allow extras safely
}

/**
 * Formats a local Date object into YYYY-MM-DD without timezone offset issues.
 */
export function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Converts dynamic raw API attendance statuses to AttendanceFinal status.
 */
export function parseAttendanceStatus(
  rawStatus: string,
): AttendanceFinal["status"] {
  switch (rawStatus.toUpperCase()) {
    case "A":
      return "Absent";
    case "LV":
      return "LV";
    case "#":
      return "Weekend";
    case "HOLIDAY":
      return "Holiday";
    default:
      return "Attended";
  }
}

/**
 * Maps a raw backend API row to an AttendanceFinal domain object.
 */
export function transformApiRowToAttendance(
  r: ApiAttendanceRow,
  emp: Employee,
  index: number,
): AttendanceFinal {
  return {
    id: String(r.id ?? `${emp.personId}-${index}`),
    rawId: String(r.id ?? ""),
    personId: emp.personId,
    name: emp.name,
    departmentId: emp.departmentId,
    unitId: emp.unitId,
    date: String(r.date ?? ""),
    week: String(r.week ?? ""),
    timetable: String(r.timetable ?? ""),
    checkIn: String(r.check_in ?? ""),
    checkOut: String(r.check_out ?? ""),
    work: Number(r.work_min ?? 0),
    ot: Number(r.ot_min ?? 0),
    attended: Number(r.attended_min ?? 0),
    late: Number(r.late_min ?? 0),
    early: Number(r.early_min ?? 0),
    absent: Number(r.absent_min ?? 0),
    leave: Number(r.leave_min ?? 0),
    status: parseAttendanceStatus(String(r.status ?? "")),
    notes: String(r.notes ?? ""),
    verified: Boolean(r.verified_at),
  };
}
