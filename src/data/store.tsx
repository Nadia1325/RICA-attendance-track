import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  Anomaly,
  AttendanceFinal,
  AttendanceRaw,
  AuditLog,
  Employee,
  Department,
  Holiday,
  LeaveEntry,
  LeaveType,
  Shift,
  UploadBatch,
  User,
} from "../types";
import {
  auditLogs as seedLogs,
  batches as seedBatches,
  buildSeedAttendance,
  departments,
  employees as seedEmployees,
  holidays as seedHolidays,
  leaves as seedLeaves,
  shifts as seedShifts,
  units,
  users as seedUsers,
} from "./seed";
import { apiConfigured, apiRequest, refreshApiData } from "../lib/api";

const seeded = buildSeedAttendance();

export interface AppState {
  currentUser: User | null;
  users: User[];
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  holidays: Holiday[];
  batches: UploadBatch[];
  raw: AttendanceRaw[];
  finals: AttendanceFinal[];
  anomalies: Anomaly[];
  leaves: LeaveEntry[];
  logs: AuditLog[];
  login: (identifier: string, password: string) => Promise<boolean>;
  changeOwnPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  importRaw: (rows: AttendanceRaw[], fileName: string) => { duplicates: number; anomalies: number; batchId: string };
  verifyRecord: (id: string, patch: Partial<AttendanceFinal>, note: string) => void | Promise<void>;
  addLeave: (entry: Omit<LeaveEntry, "id" | "createdBy" | "status" | "days"> & { status?: LeaveEntry["status"] }) => void | Promise<void>;
  addHoliday: (h: Omit<Holiday, "id">) => void | Promise<void>;
  updateHoliday: (id: string, patch: Partial<Omit<Holiday, "id">>) => void | Promise<void>;
  deleteHoliday: (id: string) => void | Promise<void>;
  addShift: (s: Omit<Shift, "id">) => void | Promise<void>;
  updateShift: (id: string, patch: Partial<Omit<Shift, "id">>) => void | Promise<void>;
  deleteShift: (id: string) => void;
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Omit<Employee, "id">>) => void;
  setEmployeeStatus: (id: string, status: Employee["status"]) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (d: Omit<Department, "id">) => void | Promise<void>;
  updateDepartment: (id: string, patch: Partial<Omit<Department, "id">>) => void | Promise<void>;
  addUser: (u: Omit<User, "id" | "avatarInitials" | "passwordHash" | "active"> & { password: string }) => Promise<void>;
  updateUser: (id: string, patch: Partial<Pick<User, "name" | "email" | "role" | "departmentId" | "active">>) => void | Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => void | Promise<void>;
  resolveAnomaly: (id: string, note?: string) => void | Promise<void>;
  scopedEmployees: () => Employee[];
  scopedRaw: () => AttendanceRaw[];
  scopedFinals: () => AttendanceFinal[];
  scopedAnomalies: () => Anomaly[];
}

const AppContext = createContext<AppState | null>(null);

const STORAGE = {
  users: "rica-users-v2",
  employees: "rica-employees-v2",
  shifts: "rica-shifts-v2",
  holidays: "rica-holidays-v2",
  batches: "rica-batches-v2",
  raw: "rica-raw-v2",
  finals: "rica-finals-v2",
  anomalies: "rica-anomalies-v2",
  leaves: "rica-leaves-v2",
  logs: "rica-logs-v2",
  session: "rica-session-v2",
};

function loadState<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function migrateDepartmentId(id: string | undefined) {
  if (id === "d-res") return "d-fppiu";
  if (id === "d-ict") return "d-itu";
  return id;
}

type ApiRow = Record<string, any>;
const asArray = (value: unknown): ApiRow[] => Array.isArray(value) ? value as ApiRow[] : [];
const attendanceStatus = (value: unknown): AttendanceFinal["status"] => {
  const status = String(value ?? "").toUpperCase();
  if (["A", "ABSENT"].includes(status)) return "Absent";
  if (status === "LV") return "LV";
  if (status === "#" || status === "WEEKEND") return "Weekend";
  if (status === "HOLIDAY") return "Holiday";
  return "Attended";
};
const apiRaw = (row: ApiRow): AttendanceRaw => ({
  id: String(row.id), batchId: String(row.batch_id ?? ""), no: Number(row.row_no ?? 0), personId: String(row.person_id ?? ""),
  name: String(row.name ?? "Unknown employee"), department: String(row.department ?? ""), position: String(row.position ?? ""), gender: String(row.gender ?? ""),
  date: String(row.date ?? ""), week: String(row.week ?? ""), timetable: String(row.timetable ?? ""), checkIn: String(row.check_in ?? ""), checkOut: String(row.check_out ?? ""),
  work: Number(row.work_min ?? 0), ot: Number(row.ot_min ?? 0), attended: Number(row.attended_min ?? 0), late: Number(row.late_min ?? 0), early: Number(row.early_min ?? 0),
  absent: Number(row.absent_min ?? 0), leave: Number(row.leave_min ?? 0), status: String(row.status ?? ""), records: String(row.records ?? ""),
});

function saveState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Frontend-only mode: keep the live state even if browser storage is unavailable.
  }
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}


function detectAnomalies(row: AttendanceFinal): Anomaly[] {
  const flags: Anomaly[] = [];
  const base = {
    attendanceId: row.id,
    personId: row.personId,
    name: row.name,
    departmentId: row.departmentId,
    unitId: row.unitId,
    date: row.date,
    resolved: false,
  };
  if (!row.checkIn && row.status !== "LV" && row.status !== "Absent" && row.status !== "Holiday") {
    flags.push({ ...base, id: `an-${row.id}-in`, type: "missing_check_in", severity: "high", message: "Missing check-in punch." });
  }
  if (!row.checkOut && row.status !== "LV" && row.status !== "Absent" && row.status !== "Holiday") {
    flags.push({ ...base, id: `an-${row.id}-out`, type: "missing_check_out", severity: "high", message: "Missing check-out punch." });
  }
  if (row.work < 0) {
    flags.push({ ...base, id: `an-${row.id}-neg`, type: "negative_work", severity: "high", message: `Negative work minutes (${row.work}).` });
  }
  if (row.status === "Attended" && row.attended === 0) {
    flags.push({ ...base, id: `an-${row.id}-mm`, type: "status_mismatch", severity: "medium", message: "Status is Attended but attended minutes = 0." });
  }
  if (row.status === "Absent" && row.absent <= 0) {
    flags.push({ ...base, id: `an-${row.id}-abs`, type: "absent_inconsistency", severity: "medium", message: "Absent status with inconsistent duration." });
  }
  return flags;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function inScope(user: User | null, departmentId: string, unitId: string) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "director") return true;
  if (user.role === "hod") return user.departmentId === departmentId;
  return user.unitId === unitId;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadState(STORAGE.users, seedUsers).filter((user) => Boolean(user.passwordHash)));
  const [employees, setEmployees] = useState<Employee[]>(() => loadState(STORAGE.employees, seedEmployees).map((employee) => ({ ...employee, departmentId: migrateDepartmentId(employee.departmentId)! })));
  const [departmentList, setDepartmentList] = useState<Department[]>(() => loadState("rica-departments-v3", departments));
  const [shifts, setShifts] = useState(() => loadState(STORAGE.shifts, seedShifts));
  const [holidays, setHolidays] = useState(() => loadState(STORAGE.holidays, seedHolidays));
  const [batches, setBatches] = useState(() => loadState(STORAGE.batches, seedBatches));
  const [raw, setRaw] = useState(() => loadState(STORAGE.raw, seeded.raw));
  const [finals, setFinals] = useState<AttendanceFinal[]>(() => loadState(STORAGE.finals, seeded.finals).map((row) => ({ ...row, departmentId: migrateDepartmentId(row.departmentId)! })));
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => loadState(STORAGE.anomalies, seeded.anomalies).map((row) => ({ ...row, departmentId: migrateDepartmentId(row.departmentId)! })));
  const [leaves, setLeaves] = useState<LeaveEntry[]>(() => loadState(STORAGE.leaves, seedLeaves).map((row) => ({ ...row, departmentId: migrateDepartmentId(row.departmentId)! })));
  const [logs, setLogs] = useState(() => loadState(STORAGE.logs, seedLogs));
  const [apiDataVersion, setApiDataVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      if (apiConfigured && localStorage.getItem("rica-api-access-token")) {
        const saved = localStorage.getItem("rica-api-user");
        if (saved) return JSON.parse(saved) as User;
      }
      if (apiConfigured) return null;
      const id = localStorage.getItem(STORAGE.session);
      return id ? users.find((u) => u.id === id && u.active) ?? null : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.removeItem("rica-api-access-token");
    localStorage.removeItem("rica-api-refresh-token");
    localStorage.removeItem("rica-api-user");
    sessionStorage.removeItem("rica-api-force-password-change");
  }, []);

  // Disabled in frontend-only mode; local demo sessions load from browser storage above.
  useEffect(() => {
    if (!apiConfigured) return;
    const token = localStorage.getItem("rica-api-access-token");
    if (!token) return;
    let active = true;
    void apiRequest<Record<string, unknown>>("/api/auth/me", {}, token).then((payload) => {
      const rawUser = (payload.user ?? payload.data ?? payload) as Record<string, unknown>;
      const roleName = String(rawUser.role ?? "").toUpperCase();
      const role = roleName === "ADMIN" ? "admin" : roleName === "DIRECTOR" ? "director" : roleName === "HOD" ? "hod" : null;
      if (!role) throw new Error("Backend returned an unsupported role.");
      const name = String(rawUser.name ?? rawUser.full_name ?? rawUser.username ?? "RICA user");
      const restored: User = { id: String(rawUser.id ?? rawUser.user_id ?? ""), name, email: String(rawUser.email ?? ""), role, departmentId: rawUser.department_id == null ? undefined : String(rawUser.department_id), avatarInitials: initials(name), passwordHash: "", active: true };
      if (rawUser.must_change_password) sessionStorage.setItem("rica-api-force-password-change", "1");
      else sessionStorage.removeItem("rica-api-force-password-change");
      if (active && restored.id) { localStorage.setItem("rica-api-user", JSON.stringify(restored)); setCurrentUser(restored); }
    }).catch(() => {
      localStorage.removeItem("rica-api-access-token");
      localStorage.removeItem("rica-api-refresh-token");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("rica-api-access-token");
    if (!apiConfigured || !currentUser || !token) return;
    let active = true;
    void apiRequest<unknown>("/api/departments", {}, token).then((payload) => {
      const rows = Array.isArray(payload) ? payload : Array.isArray((payload as { departments?: unknown[] })?.departments) ? (payload as { departments: unknown[] }).departments : null;
      if (!rows || !active) return;
      const mapped: Department[] = rows.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const d = item as Record<string, unknown>;
        const id = String(d.id ?? d.department_id ?? "");
        const name = String(d.name ?? d.department_name ?? d.office ?? "");
        return id && name ? [{ id, name, code: String(d.code ?? name.replace(/^RICA\/?/i, "").slice(0, 8).toUpperCase()), headId: d.head_id == null ? undefined : String(d.head_id) }] : [];
      });
      if (mapped.length) setDepartmentList(mapped);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [currentUser]);

  useEffect(() => {
    const refresh = () => setApiDataVersion((version) => version + 1);
    window.addEventListener("rica-api-data-refresh", refresh);
    return () => window.removeEventListener("rica-api-data-refresh", refresh);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("rica-api-access-token");
    if (!apiConfigured || !currentUser || !token) return;
    let active = true;
    const load = async <T,>(path: string) => apiRequest<T>(path, {}, localStorage.getItem("rica-api-access-token") ?? token);
    const loadAllAttendance = async (path: string) => {
      const rows: ApiRow[] = [];
      for (let skip = 0; skip < 10000; skip += 500) {
        const page = await load<unknown>(`${path}${path.includes("?") ? "&" : "?"}take=500&skip=${skip}`);
        const pageRows = asArray(page);
        rows.push(...pageRows);
        if (pageRows.length < 500) break;
      }
      return rows;
    };
    void Promise.allSettled([
      load<unknown>("/api/departments"), load<unknown>("/api/employees"), load<unknown>("/api/shifts"), load<unknown>("/api/holidays"),
      loadAllAttendance("/api/attendance/raw"), loadAllAttendance("/api/attendance/final"), load<unknown>("/api/attendance/anomalies?take=500"),
      load<unknown>("/api/attendance/batches"), load<unknown>("/api/leaves"),
      ...(currentUser.role === "admin" ? [load<unknown>("/api/users"), load<unknown>("/api/audit-logs?take=500")] : []),
    ]).then((results) => {
      if (!active) return;
      const result = (index: number) => results[index]?.status === "fulfilled" ? results[index]!.value : null;
      const remoteDepartments = asArray(result(0)).map((d) => ({ id: String(d.id), name: String(d.name), code: String(d.office ?? d.name).slice(0, 8).toUpperCase(), headId: undefined }));
      const employeeRows = asArray(result(1));
      const remoteEmployees: Employee[] = employeeRows.map((e) => {
        const departmentId = String(e.department_id ?? "");
        return { id: String(e.id), personId: String(e.person_id ?? ""), name: String(e.full_name ?? ""), departmentId, unitId: `api-unit-${departmentId}`, position: String(e.position ?? ""), gender: String(e.gender ?? "").toLowerCase().startsWith("f") ? "Female" : "Male", shiftId: String(e.shift_id ?? ""), status: e.is_active === false ? "Inactive" : "Active" };
      });
      const employeeByPerson = new Map(remoteEmployees.map((e) => [e.personId, e]));
      const remoteShifts: Shift[] = asArray(result(2)).map((s) => ({ id: String(s.id), name: String(s.name), startTime: String(s.start_time ?? "08:00"), endTime: String(s.end_time ?? "17:00"), timetable: `${s.start_time ?? "08:00"}-${s.end_time ?? "17:00"}`, graceMinutes: 0 }));
      const remoteHolidays: Holiday[] = asArray(result(3)).map((h) => ({ id: String(h.id), name: String(h.name), date: String(h.date), type: h.is_recurring ? "Organizational" : "Public" }));
      const mapFinal = (r: ApiRow, idOverride?: string): AttendanceFinal => {
        const employee = employeeByPerson.get(String(r.person_id ?? ""));
        const departmentId = employee?.departmentId ?? String(r.department_id ?? "");
        return { id: idOverride ?? String(r.id), rawId: idOverride ?? String(r.id), personId: String(r.person_id ?? ""), name: String(r.name ?? ""), departmentId, unitId: employee?.unitId ?? `api-unit-${departmentId}`, date: String(r.date ?? ""), week: String(r.week ?? ""), timetable: String(r.timetable ?? ""), checkIn: String(r.check_in ?? ""), checkOut: String(r.check_out ?? ""), work: Number(r.work_min ?? 0), ot: Number(r.ot_min ?? 0), attended: Number(r.attended_min ?? 0), late: Number(r.late_min ?? 0), early: Number(r.early_min ?? 0), absent: Number(r.absent_min ?? 0), leave: Number(r.leave_min ?? 0), status: attendanceStatus(r.status), notes: String(r.notes ?? ""), verified: Boolean(r.verified_at), verifiedBy: undefined };
      };
      const rawRows = asArray(result(4));
      const finalRows = asArray(result(5));
      const remoteAnomalies: Anomaly[] = asArray(result(6)).flatMap((a) => {
        const record = (a.record ?? {}) as ApiRow;
        const employee = employeeByPerson.get(String(record.person_id ?? ""));
        const departmentId = employee?.departmentId ?? "";
        const kind = String(a.type ?? "").toUpperCase();
        const type: Anomaly["type"] = kind.includes("PUNCH") ? (!record.check_in || record.check_in === "-" ? "missing_check_in" : "missing_check_out") : kind.includes("NEGATIVE") ? "negative_work" : kind.includes("ABSENT") ? "absent_inconsistency" : "status_mismatch";
        return [{ id: String(a.id), attendanceId: String(a.attendance_raw_id), personId: String(record.person_id ?? ""), name: String(record.name ?? "Unknown employee"), departmentId, unitId: employee?.unitId ?? `api-unit-${departmentId}`, date: String(record.date ?? ""), type, severity: kind.includes("MISSING") || kind.includes("NEGATIVE") ? "high" : "medium", message: String(a.message ?? "Attendance anomaly"), resolved: Boolean(a.resolved) }];
      });
      const remoteBatches: UploadBatch[] = asArray(result(7)).map((b) => ({ id: String(b.id), fileName: String(b.filename ?? "Attendance import"), uploadedAt: String(b.createdAt ?? ""), uploadedBy: String(b.uploadedById ?? "Admin"), rowCount: Number(b.rowCount ?? 0), duplicates: Number(b.duplicateCount ?? 0), anomalies: Number(b.anomalyCount ?? 0), status: "Imported" }));
      const remoteLeaves: LeaveEntry[] = asArray(result(8)).map((l) => { const employee = employeeByPerson.get(String(l.person_id ?? "")); const startDate = String(l.start_date ?? ""); const endDate = String(l.end_date ?? startDate); return { id: String(l.id), personId: String(l.person_id ?? ""), employeeName: String(l.name ?? ""), departmentId: employee?.departmentId ?? "", unitId: employee?.unitId ?? "", type: ({ ANNUAL: "Annual", SICK: "Sick", BUSINESS_TRIP: "Business Trip", MATERNITY: "Maternity", PATERNITY: "Paternity", UNPAID: "Unpaid" } as Record<string, LeaveType>)[String(l.leave_type)] ?? "Annual", startDate, endDate, days: Math.max(1, Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1), reason: String(l.reason ?? ""), status: "Approved", createdBy: String(l.created_by_id ?? "") }; });
      if (remoteDepartments.length) setDepartmentList(remoteDepartments);
      setEmployees(remoteEmployees);
      setShifts(remoteShifts);
      setHolidays(remoteHolidays);
      setRaw(rawRows.map(apiRaw));
      const mergedFinals = new Map<string, AttendanceFinal>();
      const finalByPersonDate = new Map(finalRows.map((row) => [`${row.person_id}|${row.date}`, row]));
      for (const row of rawRows) mergedFinals.set(String(row.id), mapFinal(finalByPersonDate.get(`${row.person_id}|${row.date}`) ?? row, String(row.id)));
      for (const row of finalRows) {
        const matchingRaw = rawRows.find((rawRow) => rawRow.person_id === row.person_id && rawRow.date === row.date);
        if (!matchingRaw) mergedFinals.set(String(row.id), mapFinal(row));
      }
      setFinals([...mergedFinals.values()]);
      setAnomalies(remoteAnomalies);
      setBatches(remoteBatches);
      setLeaves(remoteLeaves);
      if (currentUser.role === "admin" && result(9)) setUsers(asArray(result(9)).map((u) => ({ id: String(u.id), name: String(u.full_name ?? u.username), email: String(u.email ?? ""), role: String(u.role).toLowerCase() as User["role"], departmentId: u.department_id == null ? undefined : String(u.department_id), avatarInitials: initials(String(u.full_name ?? u.username)), passwordHash: "", active: u.is_active !== false })));
      const auditIndex = currentUser.role === "admin" ? 10 : -1;
      if (auditIndex >= 0 && result(auditIndex)) setLogs(asArray(result(auditIndex)).map((l) => ({ id: String(l.id), timestamp: String(l.created_at ?? ""), userId: String(l.user_id ?? ""), userName: String(l.user_id ?? "System"), action: String(l.action ?? ""), entity: String(l.entity_type ?? ""), details: String(l.entity_id ?? ""), delta: l.delta ? JSON.stringify(l.delta) : undefined })));
    });
    return () => { active = false; };
  }, [currentUser, apiDataVersion]);

  useEffect(() => saveState(STORAGE.users, users), [users]);
  useEffect(() => saveState(STORAGE.employees, employees), [employees]);
  useEffect(() => saveState("rica-departments-v3", departmentList), [departmentList]);
  useEffect(() => saveState(STORAGE.shifts, shifts), [shifts]);
  useEffect(() => saveState(STORAGE.holidays, holidays), [holidays]);
  useEffect(() => saveState(STORAGE.batches, batches), [batches]);
  useEffect(() => saveState(STORAGE.raw, raw), [raw]);
  useEffect(() => saveState(STORAGE.finals, finals), [finals]);
  useEffect(() => saveState(STORAGE.anomalies, anomalies), [anomalies]);
  useEffect(() => saveState(STORAGE.leaves, leaves), [leaves]);
  useEffect(() => saveState(STORAGE.logs, logs), [logs]);
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(STORAGE.session, currentUser.id);
      else localStorage.removeItem(STORAGE.session);
    } catch {}
  }, [currentUser]);

  // Keep open RICA dashboards synchronized when an Admin changes shared data.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      const reload = <T,>(key: string, setter: Dispatch<SetStateAction<T[]>>) => {
        if (event.key === key && event.newValue) {
          try { setter(JSON.parse(event.newValue) as T[]); } catch {}
        }
      };
      reload<User>(STORAGE.users, setUsers);
      reload<Employee>(STORAGE.employees, setEmployees);
      reload<Shift>(STORAGE.shifts, setShifts);
      reload<Holiday>(STORAGE.holidays, setHolidays);
      reload<UploadBatch>(STORAGE.batches, setBatches);
      reload<AttendanceRaw>(STORAGE.raw, setRaw);
      reload<AttendanceFinal>(STORAGE.finals, setFinals);
      reload<Anomaly>(STORAGE.anomalies, setAnomalies);
      reload<LeaveEntry>(STORAGE.leaves, setLeaves);
      reload<AuditLog>(STORAGE.logs, setLogs);
      if (event.key === STORAGE.users && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as User[];
          setCurrentUser((cur) => cur ? next.find((u) => u.id === cur.id && u.active) ?? null : null);
        } catch {}
      }
      if (event.key === "rica-departments-v3" && event.newValue) {
        try { setDepartmentList(JSON.parse(event.newValue) as Department[]); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function log(action: string, entity: string, details: string, delta?: string) {
    if (!currentUser) return;
    setLogs((prev) => [
      {
        id: `a-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        entity,
        details,
        delta,
      },
      ...prev,
    ]);
  }

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      users,
      employees,
      departments: departmentList,
      shifts,
      holidays,
      batches,
      raw,
      finals,
      anomalies,
      leaves,
      logs,
      login: async (identifier, password) => {
        if (apiConfigured) {
          try {
            const result = await apiRequest<Record<string, unknown>>("/api/auth/login", { method: "POST", body: JSON.stringify({ identifier: identifier.trim(), password }) });
            const tokens = result.tokens as Record<string, unknown> | undefined;
            const token = String(result.access_token ?? result.accessToken ?? tokens?.access_token ?? "");
            if (!token) return false;
            const profile = await apiRequest<Record<string, unknown>>("/api/auth/me", {}, token);
            const rawUser = (profile.user ?? profile.data ?? profile) as Record<string, unknown>;
            const roleName = String(rawUser.role ?? "").toUpperCase();
            const role = roleName === "ADMIN" ? "admin" : roleName === "DIRECTOR" ? "director" : roleName === "HOD" ? "hod" : null;
            if (!role) return false;
            const name = String(rawUser.name ?? rawUser.full_name ?? rawUser.username ?? identifier);
            const remoteUser: User = { id: String(rawUser.id ?? rawUser.user_id ?? ""), name, email: String(rawUser.email ?? identifier), role, departmentId: rawUser.department_id == null ? undefined : String(rawUser.department_id), avatarInitials: initials(name), passwordHash: "", active: rawUser.active !== false && rawUser.is_active !== false };
            if (!remoteUser.id || !remoteUser.active) return false;
            localStorage.setItem("rica-api-access-token", token);
            const refresh = result.refresh_token ?? tokens?.refresh_token;
            if (refresh) localStorage.setItem("rica-api-refresh-token", String(refresh));
            if (result.must_change_password) sessionStorage.setItem("rica-api-force-password-change", "1");
            else sessionStorage.removeItem("rica-api-force-password-change");
            localStorage.setItem("rica-api-user", JSON.stringify(remoteUser));
            setCurrentUser(remoteUser);
            return true;
          } catch (error) {
            if (error instanceof Error && !/401|403|invalid|credential/i.test(error.message)) throw error;
            return false;
          }
        }
        const normalized = identifier.trim().toLowerCase();
        const found = users.find((u) =>
          u.active && (u.email.toLowerCase() === normalized || u.name.toLowerCase() === normalized),
        );
        if (!found) return false;
        const hash = await hashPassword(password);
        if (hash !== found.passwordHash) return false;
        setCurrentUser(found);
        setLogs((prev) => [
          {
            id: `a-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: found.id,
            userName: found.name,
            action: "login",
            entity: "users",
            details: "Successful sign-in",
          },
          ...prev,
        ]);
        return true;
      },
      changeOwnPassword: async (currentPassword, newPassword) => {
        if (!currentUser) throw new Error("Sign in before changing your password.");
        if (newPassword.length < 8) throw new Error("Use at least 8 characters for your new password.");
        const account = users.find((user) => user.id === currentUser.id && user.active);
        if (!account) throw new Error("Your account could not be found.");
        if (await hashPassword(currentPassword) !== account.passwordHash) throw new Error("The current password is incorrect.");
        const passwordHash = await hashPassword(newPassword);
        setUsers((prev) => prev.map((user) => user.id === currentUser.id ? { ...user, passwordHash } : user));
        setCurrentUser((user) => user?.id === currentUser.id ? { ...user, passwordHash } : user);
        sessionStorage.removeItem("rica-api-force-password-change");
        log("edit", "users", `Changed password for ${currentUser.email}`);
      },
      logout: () => {
        const token = localStorage.getItem("rica-api-access-token");
        if (apiConfigured && token) void apiRequest("/api/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: localStorage.getItem("rica-api-refresh-token") }) }, token).catch(() => undefined);
        localStorage.removeItem("rica-api-access-token");
        localStorage.removeItem("rica-api-refresh-token");
        localStorage.removeItem("rica-api-user");
        sessionStorage.removeItem("rica-api-force-password-change");
        if (currentUser) log("logout", "users", "Signed out");
        setCurrentUser(null);
      },
      importRaw: (rows, fileName) => {
        const batchId = `BAT-${Date.now()}`;
        const existingKeys = new Set(raw.map((r) => `${r.personId}|${r.date}`));
        let duplicates = 0;
        const unique: AttendanceRaw[] = [];
        rows.forEach((r, i) => {
          const key = `${r.personId}|${r.date}`;
          if (existingKeys.has(key)) {
            duplicates += 1;
            return;
          }
          existingKeys.add(key);
          unique.push({ ...r, id: `${batchId}-${i + 1}`, batchId, no: i + 1 });
        });

        const newFinals: AttendanceFinal[] = unique.map((r) => {
          const emp = employees.find((e) => e.personId === r.personId);
          return {
            id: `fin-${r.personId}-${r.date}-${batchId}`,
            rawId: r.id,
            personId: r.personId,
            name: r.name,
            departmentId: emp?.departmentId ?? "d-admin",
            unitId: emp?.unitId ?? "u-exec",
            date: r.date,
            week: r.week,
            timetable: r.timetable,
            checkIn: r.checkIn,
            checkOut: r.checkOut,
            work: r.work,
            ot: r.ot,
            attended: r.attended,
            late: r.late,
            early: r.early,
            absent: r.absent,
            leave: r.leave,
            status: (["Attended", "Absent", "LV", "Holiday", "Weekend"].includes(r.status)
              ? r.status
              : "Attended") as AttendanceFinal["status"],
            notes: "",
            verified: false,
          };
        });
        const newAnoms = newFinals.flatMap(detectAnomalies);
        setRaw((prev) => [...unique, ...prev]);
        setFinals((prev) => [...newFinals, ...prev]);
        setAnomalies((prev) => [...newAnoms, ...prev]);
        setBatches((prev) => [
          {
            id: batchId,
            fileName,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.name ?? "System",
            rowCount: unique.length,
            duplicates,
            anomalies: newAnoms.length,
            status: "Imported",
          },
          ...prev,
        ]);
        log("upload", "attendance_raw", `Imported ${fileName} as ${batchId} (${unique.length} rows, ${duplicates} duplicates)`);
        return { duplicates, anomalies: newAnoms.length, batchId };
      },
      verifyRecord: async (id, patch, note) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before verifying attendance.");
          const status = patch.status === "Attended" ? "W" : patch.status === "Absent" ? "A" : patch.status === "Weekend" ? "#" : patch.status;
          await apiRequest(`/api/attendance/raw/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...(patch.checkIn !== undefined ? { check_in: patch.checkIn } : {}), ...(patch.checkOut !== undefined ? { check_out: patch.checkOut } : {}), ...(patch.work !== undefined ? { work_min: patch.work } : {}), ...(patch.ot !== undefined ? { ot_min: patch.ot } : {}), ...(patch.attended !== undefined ? { attended_min: patch.attended } : {}), ...(patch.late !== undefined ? { late_min: patch.late } : {}), ...(patch.early !== undefined ? { early_min: patch.early } : {}), ...(patch.absent !== undefined ? { absent_min: patch.absent } : {}), ...(patch.leave !== undefined ? { leave_min: patch.leave } : {}), ...(status !== undefined ? { status } : {}), notes: note, resolve_anomalies: true, promote_to_final: true }) }, token);
        }
        setFinals((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...patch,
                  notes: note || r.notes,
                  verified: true,
                  verifiedBy: currentUser?.name,
                }
              : r,
          ),
        );
        setAnomalies((prev) =>
          prev.map((a) => (a.attendanceId === id ? { ...a, resolved: true } : a)),
        );
        const keys = Object.keys(patch).join(", ");
        log("edit", "attendance_final", `Verified ${id}`, keys);
        if (apiConfigured) refreshApiData();
      },
      addLeave: async (entry) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before recording leave.");
          const employee = employees.find((item) => item.personId === entry.personId);
          if (!employee) throw new Error("Employee is missing from the backend catalog. Refresh the employee data and try again.");
          const leaveType = ({ Annual: "ANNUAL", Sick: "SICK", "Business Trip": "BUSINESS_TRIP", Maternity: "MATERNITY", Paternity: "PATERNITY", Unpaid: "UNPAID" } as const)[entry.type];
          await apiRequest("/api/leaves", { method: "POST", body: JSON.stringify({ employee_id: employee.id, leave_type: leaveType, start_date: entry.startDate, end_date: entry.endDate, reason: entry.reason }) }, token);
        }
        const start = new Date(`${entry.startDate}T00:00:00`);
        const end = new Date(`${entry.endDate}T00:00:00`);
        const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        const id = `lv-${Date.now()}`;
        setLeaves((prev) => [
          {
            ...entry,
            id,
            days,
            status: entry.status ?? "Approved",
            createdBy: currentUser?.name ?? "System",
          },
          ...prev,
        ]);
        setFinals((prev) =>
          prev.map((r) => {
            if (r.personId !== entry.personId) return r;
            if (r.date < entry.startDate || r.date > entry.endDate) return r;
            return {
              ...r,
              status: "LV",
              leave: 480,
              attended: 0,
              work: 0,
              checkIn: "",
              checkOut: "",
              notes: `${entry.type} leave`,
              verified: true,
              verifiedBy: currentUser?.name,
            };
          }),
        );
        log("edit", "leaves", `Added ${entry.type} leave for ${entry.employeeName}`);
        if (apiConfigured) refreshApiData();
      },
      addHoliday: async (h) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing holidays.");
          const result = await apiRequest<ApiRow>("/api/holidays", { method: "POST", body: JSON.stringify({ name: h.name, date: h.date, is_recurring: h.type === "Organizational" }) }, token);
          setHolidays((prev) => [{ ...h, id: String(result.id) }, ...prev]); refreshApiData(); return;
        }
        setHolidays((prev) => [{ ...h, id: `h-${Date.now()}` }, ...prev]);
        log("edit", "holidays", `Added holiday ${h.name}`);
      },
      updateHoliday: async (id, patch) => {
        if (apiConfigured) throw new Error("The RICA backend does not provide a holiday edit endpoint.");
        setHolidays((prev) => prev.map((h) => h.id === id ? { ...h, ...patch } : h));
        log("edit", "holidays", `Updated holiday ${id}`);
      },
      deleteHoliday: async (id) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing holidays.");
          await apiRequest(`/api/holidays/${encodeURIComponent(id)}`, { method: "DELETE" }, token); refreshApiData();
        }
        setHolidays((prev) => prev.filter((h) => h.id !== id));
        log("delete", "holidays", `Deleted holiday ${id}`);
      },
      addShift: async (s) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing shifts.");
          const [start, end] = [s.startTime, s.endTime].map((v) => v.split(":").map(Number));
          const minutes = ((end[0] * 60 + end[1]) - (start[0] * 60 + start[1]) + 1440) % 1440;
          const result = await apiRequest<ApiRow>("/api/shifts", { method: "POST", body: JSON.stringify({ name: s.name, start_time: s.startTime, end_time: s.endTime, work_minutes: minutes || 480 }) }, token);
          setShifts((prev) => [{ ...s, id: String(result.id) }, ...prev]); refreshApiData(); return;
        }
        setShifts((prev) => [{ ...s, id: `s-${Date.now()}` }, ...prev]);
        log("edit", "shifts", `Added shift ${s.name}`);
      },
      updateShift: async (id, patch) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing shifts.");
          const existing = shifts.find((shift) => shift.id === id);
          const startTime = patch.startTime ?? existing?.startTime;
          const endTime = patch.endTime ?? existing?.endTime;
          const minutes = startTime && endTime ? (((Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3, 5))) - (Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5))) + 1440) % 1440) || 480 : undefined;
          await apiRequest(`/api/shifts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...(patch.name ? { name: patch.name } : {}), ...(startTime ? { start_time: startTime } : {}), ...(endTime ? { end_time: endTime } : {}), ...(minutes ? { work_minutes: minutes } : {}) }) }, token);
          refreshApiData();
        }
        setShifts((prev) => prev.map((s) => s.id === id ? { ...s, ...patch, timetable: `${patch.startTime ?? s.startTime}-${patch.endTime ?? s.endTime}` } : s));
        log("edit", "shifts", `Updated shift ${id}`);
      },
      deleteShift: (id) => {
        if (apiConfigured) throw new Error("The RICA backend does not provide a shift delete endpoint.");
        if (employees.some((e) => e.shiftId === id)) throw new Error("This shift is assigned to employees. Reassign them before deleting the shift.");
        setShifts((prev) => prev.filter((s) => s.id !== id));
        log("delete", "shifts", `Deleted shift ${id}`);
      },
      addEmployee: (e) => {
        setEmployees((prev) => [{ ...e, id: `e-${Date.now()}` }, ...prev]);
        log("edit", "employees", `Added employee ${e.name}`);
      },
      updateEmployee: (id, patch) => {
        setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, ...patch } : e));
        log("edit", "employees", `Updated employee ${id}`);
      },
      setEmployeeStatus: (id, status) => {
        setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
        log("edit", "employees", `Changed employee ${id} status to ${status}`);
      },
      deleteEmployee: (id) => {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        log("delete", "employees", `Deleted employee ${id}`);
      },
      addDepartment: async (d) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing departments.");
          const result = await apiRequest<ApiRow>("/api/departments", { method: "POST", body: JSON.stringify({ name: d.name, office: d.code }) }, token);
          setDepartmentList((prev) => [{ ...d, id: String(result.id) }, ...prev]); refreshApiData(); return;
        }
        setDepartmentList((prev) => [{ ...d, id: `d-${Date.now()}` }, ...prev]);
        log("edit", "organization", `Added department ${d.name}`);
      },
      updateDepartment: async (id, patch) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing departments.");
          await apiRequest(`/api/departments/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...(patch.name !== undefined ? { name: patch.name } : {}), ...(patch.code !== undefined ? { office: patch.code } : {}) }) }, token);
          refreshApiData();
        }
        setDepartmentList((prev) => prev.map((department) => department.id === id ? { ...department, ...patch } : department));
        log("edit", "organization", `Updated department ${id}`);
      },
      addUser: async (u) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing user accounts.");
          const username = u.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 32);
          if (username.length < 3) throw new Error("The email address must contain at least three valid characters before @ for the backend username.");
          if (u.role === "hou") throw new Error("The RICA backend supports Admin, Director, and Head of Department roles only.");
          const payload = await apiRequest<ApiRow>("/api/users", { method: "POST", body: JSON.stringify({ email: u.email.trim().toLowerCase(), username, full_name: u.name.trim(), temp_password: u.password, role: u.role.toUpperCase(), department_id: u.departmentId }) }, token);
          const created: User = { id: String(payload.id), name: String(payload.full_name ?? payload.username), email: String(payload.email), role: String(payload.role).toLowerCase() as User["role"], departmentId: payload.department_id == null ? undefined : String(payload.department_id), avatarInitials: initials(String(payload.full_name ?? payload.username)), passwordHash: "", active: payload.is_active !== false };
          setUsers((prev) => [created, ...prev]);
          refreshApiData();
          return;
        }
        const passwordHash = await hashPassword(u.password);
        const cleanEmail = u.email.trim().toLowerCase();
        if (users.some((existing) => existing.email.toLowerCase() === cleanEmail)) {
          throw new Error("An account with this email already exists.");
        }
        if (users.some((existing) => existing.name.trim().toLowerCase() === u.name.trim().toLowerCase())) {
          throw new Error("An account with this name already exists.");
        }
        setUsers((prev) => [
          { ...u, email: cleanEmail, id: `u-${Date.now()}`, avatarInitials: initials(u.name), passwordHash, active: true },
          ...prev,
        ]);
        log("edit", "users", `Created user ${cleanEmail}`);
      },
      updateUser: async (id, patch) => {
        if (apiConfigured) {
          if (patch.role === "hou") throw new Error("The RICA backend supports Admin, Director, and Head of Department roles only.");
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing user accounts.");
          const payload = {
            ...(patch.name !== undefined ? { full_name: patch.name } : {}),
            ...(patch.email !== undefined ? { email: patch.email.trim().toLowerCase(), username: patch.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 32) } : {}),
            ...(patch.role !== undefined ? { role: patch.role.toUpperCase() } : {}),
            ...(patch.departmentId !== undefined ? { department_id: patch.departmentId || null } : {}),
            ...(patch.active !== undefined ? { is_active: patch.active } : {}),
          };
          await apiRequest(`/api/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
          refreshApiData();
        }
        setUsers((prev) => prev.map((user) => user.id === id ? { ...user, ...patch, avatarInitials: initials(patch.name ?? user.name) } : user));
        log("edit", "users", `Updated user ${id}`);
      },
      resetUserPassword: async (id, password) => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing user accounts.");
          await apiRequest(`/api/users/${encodeURIComponent(id)}/reset-password`, { method: "POST", body: JSON.stringify({ new_password: password }) }, token);
          refreshApiData();
          return;
        }
        const passwordHash = await hashPassword(password);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, passwordHash, active: true } : u));
        log("edit", "users", `Reset password for user ${id}`);
      },
      deleteUser: async (id) => {
        if (currentUser?.id === id) throw new Error("The active Admin account cannot delete itself.");
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before managing user accounts.");
          await apiRequest(`/api/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ is_active: false }) }, token);
          setUsers((prev) => prev.map((user) => user.id === id ? { ...user, active: false } : user));
          refreshApiData();
          return;
        }
        setUsers((prev) => prev.filter((u) => u.id !== id));
        log("delete", "users", `Deleted user ${id}`);
      },
      resolveAnomaly: async (id, note = "") => {
        if (apiConfigured) {
          const token = localStorage.getItem("rica-api-access-token");
          if (!token) throw new Error("Sign in again before resolving anomalies.");
          await apiRequest(`/api/attendance/anomalies/${encodeURIComponent(id)}/resolve`, { method: "POST", body: JSON.stringify({ note }) }, token);
          refreshApiData();
          return;
        }
        setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
      },
      scopedEmployees: () =>
        employees.filter((e) => inScope(currentUser, e.departmentId, e.unitId)),
      scopedRaw: () =>
        raw.filter((r) => {
          const emp = employees.find((e) => e.personId === r.personId);
          return emp ? inScope(currentUser, emp.departmentId, emp.unitId) : currentUser?.role === "admin" || currentUser?.role === "director";
        }),
      scopedFinals: () =>
        finals.filter((r) => inScope(currentUser, r.departmentId, r.unitId)),
      scopedAnomalies: () =>
        anomalies.filter((a) => inScope(currentUser, a.departmentId, a.unitId)),
    }),
    [currentUser, users, employees, departmentList, shifts, holidays, batches, raw, finals, anomalies, leaves, logs],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { departments, units };

export const leaveTypes: LeaveType[] = [
  "Annual",
  "Sick",
  "Business Trip",
  "Maternity",
  "Paternity",
  "Unpaid",
];
