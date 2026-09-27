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
  logout: () => void;
  importRaw: (rows: AttendanceRaw[], fileName: string) => { duplicates: number; anomalies: number; batchId: string };
  verifyRecord: (id: string, patch: Partial<AttendanceFinal>, note: string) => void;
  addLeave: (entry: Omit<LeaveEntry, "id" | "createdBy" | "status" | "days"> & { status?: LeaveEntry["status"] }) => void;
  addHoliday: (h: Omit<Holiday, "id">) => void;
  updateHoliday: (id: string, patch: Partial<Omit<Holiday, "id">>) => void;
  deleteHoliday: (id: string) => void;
  addShift: (s: Omit<Shift, "id">) => void;
  updateShift: (id: string, patch: Partial<Omit<Shift, "id">>) => void;
  deleteShift: (id: string) => void;
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Omit<Employee, "id">>) => void;
  setEmployeeStatus: (id: string, status: Employee["status"]) => void;
  deleteEmployee: (id: string) => void;
  addDepartment: (d: Omit<Department, "id">) => void;
  addUser: (u: Omit<User, "id" | "avatarInitials" | "passwordHash" | "active"> & { password: string }) => Promise<void>;
  resetUserPassword: (id: string, password: string) => Promise<void>;
  deleteUser: (id: string) => void;
  resolveAnomaly: (id: string) => void;
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
  const [users, setUsers] = useState<User[]>(() => loadState(STORAGE.users, seedUsers));
  const [employees, setEmployees] = useState(() => loadState(STORAGE.employees, seedEmployees));
  const [departmentList, setDepartmentList] = useState<Department[]>(() => loadState("rica-departments-v2", departments));
  const [shifts, setShifts] = useState(() => loadState(STORAGE.shifts, seedShifts));
  const [holidays, setHolidays] = useState(() => loadState(STORAGE.holidays, seedHolidays));
  const [batches, setBatches] = useState(() => loadState(STORAGE.batches, seedBatches));
  const [raw, setRaw] = useState(() => loadState(STORAGE.raw, seeded.raw));
  const [finals, setFinals] = useState(() => loadState(STORAGE.finals, seeded.finals));
  const [anomalies, setAnomalies] = useState(() => loadState(STORAGE.anomalies, seeded.anomalies));
  const [leaves, setLeaves] = useState(() => loadState(STORAGE.leaves, seedLeaves));
  const [logs, setLogs] = useState(() => loadState(STORAGE.logs, seedLogs));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const id = localStorage.getItem(STORAGE.session);
      return id ? users.find((u) => u.id === id && u.active) ?? null : null;
    } catch {
      return null;
    }
  });

  useEffect(() => saveState(STORAGE.users, users), [users]);
  useEffect(() => saveState(STORAGE.employees, employees), [employees]);
  useEffect(() => saveState("rica-departments-v2", departmentList), [departmentList]);
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
      if (event.key === "rica-departments-v2" && event.newValue) {
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
      logout: () => {
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
      verifyRecord: (id, patch, note) => {
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
      },
      addLeave: (entry) => {
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
      },
      addHoliday: (h) => {
        setHolidays((prev) => [{ ...h, id: `h-${Date.now()}` }, ...prev]);
        log("edit", "holidays", `Added holiday ${h.name}`);
      },
      updateHoliday: (id, patch) => {
        setHolidays((prev) => prev.map((h) => h.id === id ? { ...h, ...patch } : h));
        log("edit", "holidays", `Updated holiday ${id}`);
      },
      deleteHoliday: (id) => {
        setHolidays((prev) => prev.filter((h) => h.id !== id));
        log("delete", "holidays", `Deleted holiday ${id}`);
      },
      addShift: (s) => {
        setShifts((prev) => [{ ...s, id: `s-${Date.now()}` }, ...prev]);
        log("edit", "shifts", `Added shift ${s.name}`);
      },
      updateShift: (id, patch) => {
        setShifts((prev) => prev.map((s) => s.id === id ? { ...s, ...patch, timetable: `${patch.startTime ?? s.startTime}-${patch.endTime ?? s.endTime}` } : s));
        log("edit", "shifts", `Updated shift ${id}`);
      },
      deleteShift: (id) => {
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
      addDepartment: (d) => {
        setDepartmentList((prev) => [{ ...d, id: `d-${Date.now()}` }, ...prev]);
        log("edit", "organization", `Added department ${d.name}`);
      },
      addUser: async (u) => {
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
      resetUserPassword: async (id, password) => {
        const passwordHash = await hashPassword(password);
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, passwordHash, active: true } : u));
        log("edit", "users", `Reset password for user ${id}`);
      },
      deleteUser: (id) => {
        if (currentUser?.id === id) throw new Error("The active Admin account cannot delete itself.");
        setUsers((prev) => prev.filter((u) => u.id !== id));
        log("delete", "users", `Deleted user ${id}`);
      },
      resolveAnomaly: (id) => {
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
