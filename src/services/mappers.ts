import type {
  Anomaly,
  AttendanceFinal,
  AttendanceRaw,
  AuditLog,
  Department,
  Employee,
  Holiday,
  LeaveEntry,
  LeaveType,
  Role,
  Shift,
  UploadBatch,
  User,
} from "../types/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiRow = Record<string, any>;
export const asArray = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? (value as ApiRow[]) : [];

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function mapRole(value: unknown): Role | null {
  const name = String(value ?? "").toUpperCase();
  if (name === "ADMIN") return "admin";
  if (name === "DIRECTOR") return "director";
  if (name === "HOD") return "hod";
  return null;
}

export function mapUser(row: ApiRow, fallbackName = "RICA user"): User | null {
  const role = mapRole(row.role);
  if (!role) return null;
  const name = String(
    row.full_name ?? row.name ?? row.username ?? fallbackName,
  );
  return {
    id: String(row.id ?? row.user_id ?? ""),
    name,
    email: String(row.email ?? ""),
    role,
    departmentId:
      row.department_id == null ? undefined : String(row.department_id),
    avatarInitials: initials(name),
    passwordHash: "",
    active: row.is_active !== false && row.active !== false,
  };
}

export const attendanceStatus = (value: unknown): AttendanceFinal["status"] => {
  const status = String(value ?? "").toUpperCase();
  if (["A", "ABSENT"].includes(status)) return "Absent";
  if (status === "LV") return "LV";
  if (status === "#" || status === "WEEKEND") return "Weekend";
  if (status === "HOLIDAY") return "Holiday";
  return "Attended";
};

export const mapDepartment = (d: ApiRow): Department => ({
  id: String(d.id),
  name: String(d.name),
  code: String(d.office ?? d.name)
    .slice(0, 8)
    .toUpperCase(),
  headId: undefined,
});

export const mapEmployee = (e: ApiRow): Employee => {
  const departmentId = String(e.department_id ?? "");
  return {
    id: String(e.id),
    personId: String(e.person_id ?? ""),
    name: String(e.full_name ?? ""),
    departmentId,
    unitId: `api-unit-${departmentId}`,
    position: String(e.position ?? ""),
    gender: String(e.gender ?? "")
      .toLowerCase()
      .startsWith("f")
      ? "Female"
      : "Male",
    shiftId: String(e.shift_id ?? ""),
    status: e.is_active === false ? "Inactive" : "Active",
  };
};

export const mapShift = (s: ApiRow): Shift => ({
  id: String(s.id),
  name: String(s.name),
  startTime: String(s.start_time ?? "08:00"),
  endTime: String(s.end_time ?? "17:00"),
  timetable: `${s.start_time ?? "08:00"}-${s.end_time ?? "17:00"}`,
  graceMinutes: 0,
});

export const mapHoliday = (h: ApiRow): Holiday => ({
  id: String(h.id),
  name: String(h.name),
  date: String(h.date),
  type: h.is_recurring ? "Organizational" : "Public",
});

export const mapRaw = (row: ApiRow): AttendanceRaw => ({
  id: String(row.id),
  batchId: String(row.batch_id ?? ""),
  no: Number(row.row_no ?? 0),
  personId: String(row.person_id ?? ""),
  name: String(row.name ?? "Unknown employee"),
  department: String(row.department ?? ""),
  position: String(row.position ?? ""),
  gender: String(row.gender ?? ""),
  date: String(row.date ?? ""),
  week: String(row.week ?? ""),
  timetable: String(row.timetable ?? ""),
  checkIn: String(row.check_in ?? ""),
  checkOut: String(row.check_out ?? ""),
  work: Number(row.work_min ?? 0),
  ot: Number(row.ot_min ?? 0),
  attended: Number(row.attended_min ?? 0),
  late: Number(row.late_min ?? 0),
  early: Number(row.early_min ?? 0),
  absent: Number(row.absent_min ?? 0),
  leave: Number(row.leave_min ?? 0),
  status: String(row.status ?? ""),
  records: String(row.records ?? ""),
});

export function mapFinal(
  r: ApiRow,
  employeeByPerson: Map<string, Employee>,
  idOverride?: string,
): AttendanceFinal {
  const employee = employeeByPerson.get(String(r.person_id ?? ""));
  const departmentId = employee?.departmentId ?? String(r.department_id ?? "");
  return {
    id: idOverride ?? String(r.id),
    rawId: idOverride ?? String(r.id),
    personId: String(r.person_id ?? ""),
    name: String(r.name ?? ""),
    departmentId,
    unitId: employee?.unitId ?? `api-unit-${departmentId}`,
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
    status: attendanceStatus(r.status),
    notes: String(r.notes ?? ""),
    verified: Boolean(r.verified_at),
    verifiedBy: undefined,
  };
}

export function mapAnomaly(
  a: ApiRow,
  employeeByPerson: Map<string, Employee>,
): Anomaly {
  const record = (a.record ?? {}) as ApiRow;
  const employee = employeeByPerson.get(String(record.person_id ?? ""));
  const departmentId = employee?.departmentId ?? "";
  const kind = String(a.type ?? "").toUpperCase();
  const type: Anomaly["type"] = kind.includes("PUNCH")
    ? !record.check_in || record.check_in === "-"
      ? "missing_check_in"
      : "missing_check_out"
    : kind.includes("NEGATIVE")
      ? "negative_work"
      : kind.includes("ABSENT")
        ? "absent_inconsistency"
        : "status_mismatch";
  return {
    id: String(a.id),
    attendanceId: String(a.attendance_raw_id),
    personId: String(record.person_id ?? ""),
    name: String(record.name ?? "Unknown employee"),
    departmentId,
    unitId: employee?.unitId ?? `api-unit-${departmentId}`,
    date: String(record.date ?? ""),
    type,
    severity:
      kind.includes("MISSING") || kind.includes("NEGATIVE") ? "high" : "medium",
    message: String(a.message ?? "Attendance anomaly"),
    resolved: Boolean(a.resolved),
  };
}

export const mapBatch = (b: ApiRow): UploadBatch => ({
  id: String(b.id),
  fileName: String(b.filename ?? "Attendance import"),
  uploadedAt: String(b.createdAt ?? ""),
  uploadedBy: String(b.uploadedById ?? "Admin"),
  rowCount: Number(b.rowCount ?? 0),
  duplicates: Number(b.duplicateCount ?? 0),
  anomalies: Number(b.anomalyCount ?? 0),
  status: "Imported",
});

const LEAVE_FROM_API: Record<string, LeaveType> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  BUSINESS_TRIP: "Business Trip",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  UNPAID: "Unpaid",
};
export const LEAVE_TO_API: Record<LeaveType, string> = {
  Annual: "ANNUAL",
  Sick: "SICK",
  "Business Trip": "BUSINESS_TRIP",
  Maternity: "MATERNITY",
  Paternity: "PATERNITY",
  Unpaid: "UNPAID",
};

export function mapLeave(
  l: ApiRow,
  employeeByPerson: Map<string, Employee>,
): LeaveEntry {
  const employee = employeeByPerson.get(String(l.person_id ?? ""));
  const startDate = String(l.start_date ?? "");
  const endDate = String(l.end_date ?? startDate);
  return {
    id: String(l.id),
    personId: String(l.person_id ?? ""),
    employeeName: String(l.name ?? ""),
    departmentId: employee?.departmentId ?? "",
    unitId: employee?.unitId ?? "",
    type: LEAVE_FROM_API[String(l.leave_type)] ?? "Annual",
    startDate,
    endDate,
    days: Math.max(
      1,
      Math.floor(
        (Date.parse(`${endDate}T00:00:00Z`) -
          Date.parse(`${startDate}T00:00:00Z`)) /
          86400000,
      ) + 1,
    ),
    reason: String(l.reason ?? ""),
    status: "Approved",
    createdBy: String(l.created_by_id ?? ""),
  };
}

export const mapAudit = (l: ApiRow): AuditLog => ({
  id: String(l.id),
  timestamp: String(l.created_at ?? ""),
  userId: String(l.user_id ?? ""),
  userName: String(l.user_name ?? l.user_id ?? "System"),
  action: String(l.action ?? ""),
  entity: String(l.entity_type ?? ""),
  details: String(l.entity_id ?? ""),
  delta: l.delta ? JSON.stringify(l.delta) : undefined,
});

/** Convert a UI status back to the backend's status code. */
export function statusToApi(status: AttendanceFinal["status"] | undefined) {
  if (status === undefined) return undefined;
  return status === "Attended"
    ? "W"
    : status === "Absent"
      ? "A"
      : status === "Weekend"
        ? "#"
        : status;
}

export function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm) + 1440) % 1440 || 480;
}
