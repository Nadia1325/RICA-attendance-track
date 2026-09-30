// src/data/store.ts
import { useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
  loggedOut,
  setCredentials,
  passwordChanged,
} from "../features/auth/authSlice";

import {
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
  useGetHolidaysQuery,
} from "../services/referenceApi";
import {
  useGetAnomaliesQuery,
  useGetRawAttendanceQuery,
} from "../services/attendanceApi";
import {
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} from "../services/authApi";

import {
  mapDepartment,
  mapEmployee,
  mapHoliday,
  mapRaw,
  mapAnomaly,
  mapUser,
} from "../services/mappers";

import type {
  Anomaly,
  AttendanceFinal,
  Department,
  Employee,
  Holiday,
} from "../types/types";
import type { RawAttendanceParams } from "../services/attendanceApi";
export type RawAttendanceQueryParams = RawAttendanceParams;

export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  departmentId?: string;
}

export interface UseAppReturn {
  currentUser: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  changeOwnPassword: (current: string, next: string) => Promise<void>;
  logout: () => void;
  scopedEmployees: () => Employee[];
  scopedFinals: () => AttendanceFinal[];
  scopedAnomalies: () => Anomaly[];
  employees: Employee[];
  departments: Department[];
  holidays: Holiday[];
  finals: AttendanceFinal[];
  anomalies: Anomaly[];
}

export function useApp(queryParams?: RawAttendanceQueryParams): UseAppReturn {
  const currentUser = useAppSelector((s) => s.auth.user) as User | null;
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);
  const dispatch = useAppDispatch();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const activeParams: RawAttendanceQueryParams = useMemo(
    () => queryParams ?? { date: todayStr },
    [queryParams, todayStr],
  );

  // ── Mutations ───────────────────────────────────────────
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [changePasswordMutation] = useChangePasswordMutation();

  // ── Remote data (skipped while logged out) ──────────────
  const skip = !currentUser;
  const { data: rawEmployees = [] } = useGetEmployeesQuery(undefined, { skip });
  const { data: rawDepartments = [] } = useGetDepartmentsQuery(undefined, { skip });
  const { data: rawHolidays = [] } = useGetHolidaysQuery(undefined, { skip });
  const { data: rawAttendance = [] } = useGetRawAttendanceQuery(activeParams, { skip });
  const { data: rawAnomalies = [] } = useGetAnomaliesQuery(undefined, { skip });

  // ── Mapped domain objects ───────────────────────────────
  const departments = useMemo<Department[]>(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );
  const employees = useMemo<Employee[]>(
    () => rawEmployees.map(mapEmployee),
    [rawEmployees],
  );
  const holidays = useMemo<Holiday[]>(
    () => rawHolidays.map(mapHoliday),
    [rawHolidays],
  );

  const finals = useMemo<AttendanceFinal[]>(
    () =>
      rawAttendance.map((r, index) => {
        const raw = mapRaw(r);
        const id = raw.id ?? `${raw.personId}-${raw.date}-${index}`;
        return {
          id,
          rawId: id,
          personId: raw.personId,
          name: raw.name,
          departmentId: "",
          unitId: "",
          date: raw.date,
          week: raw.week,
          timetable: raw.timetable,
          checkIn: raw.checkIn,
          checkOut: raw.checkOut,
          work: raw.work,
          ot: raw.ot,
          attended: raw.attended,
          late: raw.late,
          early: raw.early,
          absent: raw.absent,
          leave: raw.leave,
          status:
            raw.status === "W"
              ? "Attended"
              : raw.status === "A"
                ? "Absent"
                : raw.status === "LV"
                  ? "LV"
                  : raw.status === "#"
                    ? "Weekend"
                    : "Attended",
          notes: "",
          verified: true,
        } satisfies AttendanceFinal;
      }),
    [rawAttendance],
  );

  const anomalies = useMemo<Anomaly[]>(() => {
    const employeeByPerson = new Map(employees.map((e) => [e.personId, e]));
    return rawAnomalies.map((a) => mapAnomaly(a, employeeByPerson));
  }, [rawAnomalies, employees]);

  // ── Scoping ─────────────────────────────────────────────
  const scopedEmployees = useCallback((): Employee[] => {
    if (!currentUser) return [];
    if (currentUser.role === "admin" || currentUser.role === "director") {
      return employees;
    }
    return employees.filter((e) => e.departmentId === currentUser.departmentId);
  }, [currentUser, employees]);

  const scopedFinals = useCallback((): AttendanceFinal[] => {
    if (!currentUser) return [];
    const scopedEmps = scopedEmployees();
    const allowed = new Set(scopedEmps.map((e) => e.personId));
    const deptByPerson = new Map(scopedEmps.map((e) => [e.personId, e.departmentId]));
    const unitByPerson = new Map(scopedEmps.map((e) => [e.personId, e.unitId]));

    return finals
      .filter((r) => allowed.has(r.personId))
      .map((r) => ({
        ...r,
        departmentId: deptByPerson.get(r.personId) ?? "",
        unitId: unitByPerson.get(r.personId) ?? "",
      }));
  }, [currentUser, finals, scopedEmployees]);

  const scopedAnomalies = useCallback((): Anomaly[] => {
    if (!currentUser) return [];
    if (currentUser.role === "admin" || currentUser.role === "director") {
      return anomalies;
    }
    return anomalies.filter((a) => a.departmentId === currentUser.departmentId);
  }, [currentUser, anomalies]);

  // ── Auth actions ────────────────────────────────────────
  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      try {
        const res = await loginMutation({ identifier, password }).unwrap();
        const accessToken = res.access_token;
        if (!accessToken || !res.user) return false;

        dispatch(
          setCredentials({
            user: mapUser(res.user),
            accessToken,
            refreshToken: res.refresh_token ?? null,
            mustChangePassword: Boolean(res.must_change_password),
          }),
        );
        return true;
      } catch {
        return false;
      }
    },
    [dispatch, loginMutation],
  );

  const changeOwnPassword = useCallback(
    async (current_password: string, new_password: string): Promise<void> => {
      await changePasswordMutation({ current_password, new_password }).unwrap();
      dispatch(passwordChanged());
    },
    [dispatch, changePasswordMutation],
  );

  const logout = useCallback(() => {
    // Best effort: revoke tokens on the server, then always clear locally.
    void logoutMutation({ refresh_token: refreshToken ?? null })
      .unwrap()
      .catch(() => undefined)
      .finally(() => dispatch(loggedOut()));
  }, [dispatch, logoutMutation, refreshToken]);

  return {
    currentUser,
    login,
    changeOwnPassword,
    logout,
    scopedEmployees,
    scopedFinals,
    scopedAnomalies,
    employees,
    departments,
    holidays,
    finals,
    anomalies,
  };
}