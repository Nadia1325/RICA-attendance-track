import type {
  Anomaly,
  AttendanceFinal,
  AttendanceRaw,
  AuditLog,
  Department,
  Employee,
  Holiday,
  LeaveEntry,
  Shift,
  Unit,
  UploadBatch,
  User,
} from "../types";

export const users: User[] = [
  {
    id: "u-admin",
    name: "Claire Mukamana",
    email: "admin@rica.rw",
    passwordHash: "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
    active: true,
    role: "admin",
    avatarInitials: "CM",
  },
  {
    id: "u-hod",
    name: "Jean Bosco Niyonzima",
    email: "hod@rica.rw",
    passwordHash: "1bb52d2d145520287d357a44aac45daf762853cf5e0529decb0f938fa29e5cf1",
    active: true,
    role: "hod",
    departmentId: "d-ops",
    avatarInitials: "JN",
  },
  {
    id: "u-hou",
    name: "Aline Uwase",
    email: "hou@rica.rw",
    passwordHash: "5bd32c8db63eac7781c78a1eadc5f58b8fb1bedf5c2771fde81c38d1c70b3db6",
    active: true,
    role: "hou",
    departmentId: "d-ops",
    unitId: "u-farm",
    avatarInitials: "AU",
  },
  {
    id: "u-dir",
    name: "Dr. Patrick Habimana",
    email: "director@rica.rw",
    passwordHash: "f67e3aea7a6bc7a517bb9498152eb498b76a6a29a95146d583e270eec1347d7d",
    active: true,
    role: "director",
    avatarInitials: "PH",
  },
];

export const departments: Department[] = [
  { id: "d-admin", name: "Administration", code: "ADM", headId: "e-01" },
  { id: "d-hr", name: "Human Resources", code: "HR", headId: "e-04" },
  { id: "d-fin", name: "Finance", code: "FIN", headId: "e-07" },
  { id: "d-ops", name: "Farm Operations", code: "OPS", headId: "e-10" },
  { id: "d-res", name: "Research & Training", code: "RES", headId: "e-16" },
  { id: "d-ict", name: "ICT", code: "ICT", headId: "e-19" },
];

export const units: Unit[] = [
  { id: "u-exec", name: "Executive Office", departmentId: "d-admin", headId: "e-01" },
  { id: "u-proc", name: "Procurement", departmentId: "d-admin", headId: "e-03" },
  { id: "u-hrdesk", name: "HR Desk", departmentId: "d-hr", headId: "e-04" },
  { id: "u-pay", name: "Payroll", departmentId: "d-hr", headId: "e-06" },
  { id: "u-acc", name: "Accounts", departmentId: "d-fin", headId: "e-07" },
  { id: "u-farm", name: "Crop Production", departmentId: "d-ops", headId: "e-10" },
  { id: "u-liv", name: "Livestock", departmentId: "d-ops", headId: "e-13" },
  { id: "u-lab", name: "Research Lab", departmentId: "d-res", headId: "e-16" },
  { id: "u-sys", name: "Systems", departmentId: "d-ict", headId: "e-19" },
];

export const shifts: Shift[] = [
  {
    id: "s-day",
    name: "Day Shift",
    timetable: "08:00-17:00",
    startTime: "08:00",
    endTime: "17:00",
    graceMinutes: 10,
  },
  {
    id: "s-field",
    name: "Field Shift",
    timetable: "07:00-16:00",
    startTime: "07:00",
    endTime: "16:00",
    graceMinutes: 15,
  },
  {
    id: "s-flex",
    name: "Flexible Office",
    timetable: "08:30-17:30",
    startTime: "08:30",
    endTime: "17:30",
    graceMinutes: 15,
  },
];

export const employees: Employee[] = [
  { id: "e-01", personId: "RICA-1001", name: "Diane Iradukunda", departmentId: "d-admin", unitId: "u-exec", position: "Executive Assistant", gender: "Female", shiftId: "s-flex", status: "Active" },
  { id: "e-02", personId: "RICA-1002", name: "Eric Ndayisaba", departmentId: "d-admin", unitId: "u-exec", position: "Office Coordinator", gender: "Male", shiftId: "s-day", status: "Active" },
  { id: "e-03", personId: "RICA-1003", name: "Sylvie Mutoni", departmentId: "d-admin", unitId: "u-proc", position: "Procurement Officer", gender: "Female", shiftId: "s-day", status: "Active" },
  { id: "e-04", personId: "RICA-1040", name: "Grace Uwimana", departmentId: "d-hr", unitId: "u-hrdesk", position: "HR Manager", gender: "Female", shiftId: "s-flex", status: "Active" },
  { id: "e-05", personId: "RICA-1041", name: "Pacifique Habimana", departmentId: "d-hr", unitId: "u-hrdesk", position: "HR Officer", gender: "Male", shiftId: "s-day", status: "Active" },
  { id: "e-06", personId: "RICA-1042", name: "Chantal Mukeshimana", departmentId: "d-hr", unitId: "u-pay", position: "Payroll Specialist", gender: "Female", shiftId: "s-day", status: "Active" },
  { id: "e-07", personId: "RICA-1070", name: "Samuel Kayitare", departmentId: "d-fin", unitId: "u-acc", position: "Finance Manager", gender: "Male", shiftId: "s-day", status: "Active" },
  { id: "e-08", personId: "RICA-1071", name: "Immaculee Ingabire", departmentId: "d-fin", unitId: "u-acc", position: "Accountant", gender: "Female", shiftId: "s-day", status: "Active" },
  { id: "e-09", personId: "RICA-1072", name: "Yves Bizimana", departmentId: "d-fin", unitId: "u-acc", position: "Budget Officer", gender: "Male", shiftId: "s-flex", status: "Active" },
  { id: "e-10", personId: "RICA-1100", name: "Jean Bosco Niyonzima", departmentId: "d-ops", unitId: "u-farm", position: "Head of Operations", gender: "Male", shiftId: "s-field", status: "Active" },
  { id: "e-11", personId: "RICA-1101", name: "Aline Uwase", departmentId: "d-ops", unitId: "u-farm", position: "Crop Unit Lead", gender: "Female", shiftId: "s-field", status: "Active" },
  { id: "e-12", personId: "RICA-1102", name: "Theogene Nsengimana", departmentId: "d-ops", unitId: "u-farm", position: "Agronomist", gender: "Male", shiftId: "s-field", status: "Active" },
  { id: "e-13", personId: "RICA-1103", name: "Olive Mukamana", departmentId: "d-ops", unitId: "u-liv", position: "Livestock Officer", gender: "Female", shiftId: "s-field", status: "Active" },
  { id: "e-14", personId: "RICA-1104", name: "Emile Nkurunziza", departmentId: "d-ops", unitId: "u-liv", position: "Veterinary Technician", gender: "Male", shiftId: "s-field", status: "Active" },
  { id: "e-15", personId: "RICA-1105", name: "Josiane Uwimana", departmentId: "d-ops", unitId: "u-farm", position: "Field Supervisor", gender: "Female", shiftId: "s-field", status: "Active" },
  { id: "e-16", personId: "RICA-1160", name: "Dr. Alice Mutesi", departmentId: "d-res", unitId: "u-lab", position: "Research Lead", gender: "Female", shiftId: "s-flex", status: "Active" },
  { id: "e-17", personId: "RICA-1161", name: "Kevin Niyonshuti", departmentId: "d-res", unitId: "u-lab", position: "Research Associate", gender: "Male", shiftId: "s-day", status: "Active" },
  { id: "e-18", personId: "RICA-1162", name: "Nadia Umutoni", departmentId: "d-res", unitId: "u-lab", position: "Training Officer", gender: "Female", shiftId: "s-day", status: "Active" },
  { id: "e-19", personId: "RICA-1190", name: "Patrick Gasana", departmentId: "d-ict", unitId: "u-sys", position: "ICT Manager", gender: "Male", shiftId: "s-flex", status: "Active" },
  { id: "e-20", personId: "RICA-1191", name: "Linda Imena", departmentId: "d-ict", unitId: "u-sys", position: "Systems Analyst", gender: "Female", shiftId: "s-day", status: "Active" },
];

export const holidays: Holiday[] = [
  { id: "h-1", name: "New Year", date: "2026-01-01", type: "Public" },
  { id: "h-2", name: "National Heroes Day", date: "2026-02-01", type: "Public" },
  { id: "h-3", name: "Kwibuka", date: "2026-04-07", type: "Public" },
  { id: "h-4", name: "Labour Day", date: "2026-05-01", type: "Public" },
  { id: "h-5", name: "Independence Day", date: "2026-07-01", type: "Public" },
  { id: "h-6", name: "RICA Staff Retreat", date: "2026-09-18", type: "Organizational" },
];

const dates = [
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-21",
  "2026-09-22",
  "2026-09-23",
  "2026-09-24",
];
const weeks = ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue", "Wed", "Thu"];

function punch(base: string, jitter: number) {
  const [h, m] = base.split(":").map(Number);
  const total = h * 60 + m + jitter;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function buildSeedAttendance() {
  const raw: AttendanceRaw[] = [];
  const finals: AttendanceFinal[] = [];
  const anomalies: Anomaly[] = [];
  let n = 1;

  employees.forEach((emp) => {
    const dept = departments.find((d) => d.id === emp.departmentId)!;
    const shift = shifts.find((s) => s.id === emp.shiftId)!;
    dates.forEach((date, di) => {
      const seed = hash(`${emp.personId}-${date}`);
      const lateJitter = seed % 23;
      const earlyLeave = seed % 11 === 0 ? 20 : 0;
      let checkIn = punch(shift.startTime, lateJitter > 12 ? lateJitter : -((seed % 6) + 2));
      let checkOut = punch(shift.endTime, 8 - (seed % 10) - earlyLeave);
      let status = "Attended";
      let work = 480;
      let attended = 480;
      let late = lateJitter > 12 ? lateJitter : 0;
      let early = earlyLeave;
      let absent = 0;
      let leave = 0;
      let ot = seed % 17 === 0 ? 45 : 0;
      let records = `${checkIn},${checkOut}`;

      const anomalyRoll = seed % 19;
      if (emp.personId === "RICA-1102" && date === "2026-09-23") {
        checkOut = "";
        records = checkIn;
        work = -15;
        attended = 0;
        status = "Attended";
      } else if (emp.personId === "RICA-1071" && date === "2026-09-22") {
        checkIn = "";
        records = checkOut;
        attended = 0;
        status = "Attended";
      } else if (emp.personId === "RICA-1105" && date === "2026-09-24") {
        checkIn = "";
        checkOut = "";
        records = "";
        work = 0;
        attended = 0;
        late = 0;
        status = "Absent";
        absent = 480;
      } else if (emp.personId === "RICA-1041" && date === "2026-09-21") {
        status = "LV";
        leave = 480;
        attended = 0;
        work = 0;
        checkIn = "";
        checkOut = "";
        records = "SICK";
      } else if (anomalyRoll === 3 && date === "2026-09-24") {
        status = "Attended";
        attended = 0;
        checkIn = punch(shift.startTime, 4);
        checkOut = "";
        records = checkIn;
      }

      const rawRow: AttendanceRaw = {
        id: `raw-${emp.personId}-${date}`,
        batchId: "BAT-2026-0924",
        no: n++,
        personId: emp.personId,
        name: emp.name,
        department: dept.name,
        position: emp.position,
        gender: emp.gender,
        date,
        week: weeks[di],
        timetable: shift.timetable,
        checkIn,
        checkOut,
        work,
        ot,
        attended,
        late,
        early,
        absent,
        leave,
        status,
        records,
      };
      raw.push(rawRow);

      const finalRow: AttendanceFinal = {
        id: `fin-${emp.personId}-${date}`,
        rawId: rawRow.id,
        personId: emp.personId,
        name: emp.name,
        departmentId: emp.departmentId,
        unitId: emp.unitId,
        date,
        week: weeks[di],
        timetable: shift.timetable,
        checkIn,
        checkOut,
        work,
        ot,
        attended,
        late,
        early,
        absent,
        leave,
        status: status as AttendanceFinal["status"],
        notes: status === "LV" ? "Sick leave recorded from device export" : "",
        verified: status === "LV" || (Boolean(checkIn) && Boolean(checkOut) && work >= 0 && !(status === "Attended" && attended === 0)),
      };
      finals.push(finalRow);

      const flags: Anomaly[] = [];
      if (!checkIn && status !== "LV" && status !== "Absent") {
        flags.push({
          id: `an-${rawRow.id}-in`,
          attendanceId: finalRow.id,
          personId: emp.personId,
          name: emp.name,
          departmentId: emp.departmentId,
          unitId: emp.unitId,
          date,
          type: "missing_check_in",
          severity: "high",
          message: "Missing check-in punch.",
          resolved: false,
        });
      }
      if (!checkOut && status !== "LV" && status !== "Absent") {
        flags.push({
          id: `an-${rawRow.id}-out`,
          attendanceId: finalRow.id,
          personId: emp.personId,
          name: emp.name,
          departmentId: emp.departmentId,
          unitId: emp.unitId,
          date,
          type: "missing_check_out",
          severity: "high",
          message: "Missing check-out punch.",
          resolved: false,
        });
      }
      if (work < 0) {
        flags.push({
          id: `an-${rawRow.id}-neg`,
          attendanceId: finalRow.id,
          personId: emp.personId,
          name: emp.name,
          departmentId: emp.departmentId,
          unitId: emp.unitId,
          date,
          type: "negative_work",
          severity: "high",
          message: `Negative work minutes (${work}).`,
          resolved: false,
        });
      }
      if (status === "Attended" && attended === 0) {
        flags.push({
          id: `an-${rawRow.id}-mm`,
          attendanceId: finalRow.id,
          personId: emp.personId,
          name: emp.name,
          departmentId: emp.departmentId,
          unitId: emp.unitId,
          date,
          type: "status_mismatch",
          severity: "medium",
          message: "Status is Attended but attended minutes = 0.",
          resolved: false,
        });
      }
      if (status === "Absent" && absent <= 0) {
        flags.push({
          id: `an-${rawRow.id}-abs`,
          attendanceId: finalRow.id,
          personId: emp.personId,
          name: emp.name,
          departmentId: emp.departmentId,
          unitId: emp.unitId,
          date,
          type: "absent_inconsistency",
          severity: "medium",
          message: "Absent status with inconsistent duration.",
          resolved: false,
        });
      }
      anomalies.push(...flags);
    });
  });

  return { raw, finals, anomalies };
}

export const batches: UploadBatch[] = [
  {
    id: "BAT-2026-0921",
    fileName: "RICA_ATT_2026-09-21.xlsx",
    uploadedAt: "2026-09-21T17:42:00",
    uploadedBy: "Claire Mukamana",
    rowCount: 20,
    duplicates: 0,
    anomalies: 1,
    status: "Verified",
  },
  {
    id: "BAT-2026-0922",
    fileName: "RICA_ATT_2026-09-22.xlsx",
    uploadedAt: "2026-09-22T17:38:00",
    uploadedBy: "Claire Mukamana",
    rowCount: 20,
    duplicates: 1,
    anomalies: 2,
    status: "Partially verified",
  },
  {
    id: "BAT-2026-0923",
    fileName: "RICA_ATT_2026-09-23.xlsx",
    uploadedAt: "2026-09-23T17:51:00",
    uploadedBy: "Claire Mukamana",
    rowCount: 20,
    duplicates: 0,
    anomalies: 2,
    status: "Partially verified",
  },
  {
    id: "BAT-2026-0924",
    fileName: "RICA_ATT_2026-09-24.xlsx",
    uploadedAt: "2026-09-24T08:12:00",
    uploadedBy: "Claire Mukamana",
    rowCount: 20,
    duplicates: 0,
    anomalies: 3,
    status: "Imported",
  },
];

export const leaves: LeaveEntry[] = [
  {
    id: "lv-1",
    personId: "RICA-1041",
    employeeName: "Pacifique Habimana",
    departmentId: "d-hr",
    unitId: "u-hrdesk",
    type: "Sick",
    startDate: "2026-09-21",
    endDate: "2026-09-21",
    days: 1,
    reason: "Medical appointment and recovery",
    status: "Approved",
    createdBy: "Claire Mukamana",
  },
  {
    id: "lv-2",
    personId: "RICA-1162",
    employeeName: "Nadia Umutoni",
    departmentId: "d-res",
    unitId: "u-lab",
    type: "Business Trip",
    startDate: "2026-09-25",
    endDate: "2026-09-26",
    days: 2,
    reason: "College of Agriculture training visit",
    status: "Pending",
    createdBy: "Aline Uwase",
  },
  {
    id: "lv-3",
    personId: "RICA-1103",
    employeeName: "Olive Mukamana",
    departmentId: "d-ops",
    unitId: "u-liv",
    type: "Annual",
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    days: 3,
    reason: "Family travel",
    status: "Approved",
    createdBy: "Claire Mukamana",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "a-1",
    timestamp: "2026-09-24T08:12:10",
    userId: "u-admin",
    userName: "Claire Mukamana",
    action: "upload",
    entity: "attendance_raw",
    details: "Imported BAT-2026-0924 (20 rows)",
  },
  {
    id: "a-2",
    timestamp: "2026-09-24T08:14:02",
    userId: "u-admin",
    userName: "Claire Mukamana",
    action: "login",
    entity: "users",
    details: "Successful sign-in",
  },
  {
    id: "a-3",
    timestamp: "2026-09-23T18:04:41",
    userId: "u-hou",
    userName: "Aline Uwase",
    action: "edit",
    entity: "attendance_final",
    details: "Corrected missing checkout for Theogene Nsengimana",
    delta: "checkOut: '' → 16:08",
  },
];
