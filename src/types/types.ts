export type Role = "admin" | "hod" | "director";

export type LeaveType =
  | "Annual"
  | "Sick"
  | "Business Trip"
  | "Maternity"
  | "Paternity"
  | "Unpaid";

export type AttendanceStatus = "Attended" | "Absent" | "LV" | "Holiday" | "Weekend";

export type AnomalyType =
  | "missing_check_in"
  | "missing_check_out"
  | "negative_work"
  | "status_mismatch"
  | "absent_inconsistency";

export type AnomalySeverity = "high" | "medium" | "low";

export type PerformanceBand = "Excellent" | "Good" | "Needs Improvement" | "Warning";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  unitId?: string;
  avatarInitials: string;
  passwordHash: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string;
}

export interface Unit {
  id: string;
  name: string;
  departmentId: string;
  headId?: string;
}

export interface Shift {
  id: string;
  name: string;
  timetable: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
}

export interface Employee {
  id: string;
  personId: string;
  name: string;
  departmentId: string;
  unitId: string;
  position: string;
  gender: "Male" | "Female";
  shiftId: string;
  status: "Active" | "Inactive";
}

export interface AttendanceRaw {
  id: string;
  batchId: string;
  no: number;
  personId: string;
  name: string;
  department: string;
  position: string;
  gender: string;
  date: string;
  week: string;
  timetable: string;
  checkIn: string;
  checkOut: string;
  work: number;
  ot: number;
  attended: number;
  late: number;
  early: number;
  absent: number;
  leave: number;
  status: string;
  records: string;
}

export interface AttendanceFinal {
  id: string;
  rawId?: string;
  personId: string;
  name: string;
  departmentId: string;
  unitId: string;
  date: string;
  week: string;
  timetable: string;
  checkIn: string;
  checkOut: string;
  work: number;
  ot: number;
  attended: number;
  late: number;
  early: number;
  absent: number;
  leave: number;
  status: AttendanceStatus;
  notes: string;
  verified: boolean;
  verifiedBy?: string;
}

export interface Anomaly {
  id: string;
  attendanceId: string;
  personId: string;
  name: string;
  departmentId: string;
  unitId: string;
  date: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  resolved: boolean;
}

export interface LeaveEntry {
  id: string;
  personId: string;
  employeeName: string;
  departmentId: string;
  unitId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdBy: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: "Public" | "Organizational";
}

export interface UploadBatch {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  rowCount: number;
  duplicates: number;
  anomalies: number;
  status: "Imported" | "Partially verified" | "Verified";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  delta?: string;
}
