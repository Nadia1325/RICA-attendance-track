import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, DateField, PageHeader } from "../../components/ui";
import { computeKpis, workingDaysInRange } from "../../lib/kpis";
import {
  mapAnomaly,
  mapBatch,
  mapDepartment,
  mapEmployee,
  mapFinal,
  mapHoliday,
  mapUser,
  useGetAnomaliesQuery,
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
  useGetFinalAttendanceQuery,
  useGetHolidaysQuery,
  useGetMyDepartmentQuery,
  useMeQuery,
} from "../../services";
import type { Employee } from "../../types/types";

import { AttendanceTrendChart } from "./AttendanceTrendChart";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStats } from "./DashboardStats";
import { DepartmentTrackingCard } from "./DepartmentTrackingCard";
import { InstitutionKpiCard } from "./InstitutionKpiCard";

type DepartmentSummary = {
  employee_count: number;
  today: {
    date: string;
    status_counts: {
      present: number;
      absent: number;
      leave: number;
      weekend_or_holiday: number;
      unrecorded: number;
    };
  };
  kpi_summary: {
    average_attendance_pct: number;
    average_punctuality_pct: number;
  };
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [today, setToday] = useState(new Date().toISOString().slice(0, 10));

  const { data: rawMe } = useMeQuery();
  const currentUser = useMemo(() => (rawMe ? mapUser(rawMe) : null), [rawMe]);
  const skip = !currentUser;

  const { data: rawEmployees = [] } = useGetEmployeesQuery(undefined, { skip });
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    rawEmployees.forEach((e) => {
      const emp = mapEmployee(e);
      map.set(emp.personId, emp);
    });
    return map;
  }, [rawEmployees]);

  const { data: rawFinals = [] } = useGetFinalAttendanceQuery(undefined, {
    skip,
  });
  const records = useMemo(
    () => rawFinals.map((r) => mapFinal(r, employeeMap)),
    [rawFinals, employeeMap],
  );

  const { data: rawAnomalies = [] } = useGetAnomaliesQuery(undefined, { skip });
  const flags = useMemo(
    () =>
      rawAnomalies
        .map((a) => mapAnomaly(a, employeeMap))
        .filter((a) => !a.resolved),
    [rawAnomalies, employeeMap],
  );

  const { data: rawBatches = [] } = useGetBatchesQuery(undefined, { skip });
  const batches = useMemo(() => rawBatches.map(mapBatch), [rawBatches]);

  const { data: rawDepartments = [] } = useGetDepartmentsQuery(undefined, {
    skip,
  });
  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );

  const { data: rawHolidays = [] } = useGetHolidaysQuery(undefined, { skip });
  const holidays = useMemo(() => rawHolidays.map(mapHoliday), [rawHolidays]);

  // Department summary for HODs
  const summaryQ = useGetMyDepartmentQuery(
    { from: `${today.slice(0, 7)}-01`, to: today },
    { skip: currentUser?.role !== "hod" },
  );
  const departmentSummary =
    (summaryQ.data as DepartmentSummary | undefined) ?? null;
  const serverToday =
    currentUser?.role === "hod" && departmentSummary?.today?.date === today
      ? departmentSummary
      : null;

  const todayRows = useMemo(
    () => records.filter((r) => r.date === today),
    [records, today],
  );

  const present =
    serverToday?.today?.status_counts?.present ??
    todayRows.filter((r) => r.status === "Attended").length;

  const late = todayRows.filter(
    (r) => r.late > 0 && r.status === "Attended",
  ).length;

  const absent =
    serverToday?.today?.status_counts?.absent ??
    todayRows.filter((r) => r.status === "Absent").length;

  const onLeave =
    serverToday?.today?.status_counts?.leave ??
    todayRows.filter((r) => r.status === "LV").length;

  const employeeTotal = serverToday?.employee_count ?? todayRows.length;
  const totalToday = Math.max(employeeTotal, 1);

  // Trend chart
  const trend = useMemo(() => {
    const dates = [...new Set(records.map((r) => r.date))].sort();
    return dates.map((date) => {
      const day = records.filter((r) => r.date === date);
      const total = Math.max(day.length, 1);
      const attended = day.filter((r) => r.status === "Attended").length;
      const lateCount = day.filter(
        (r) => r.late > 0 && r.status === "Attended",
      ).length;
      const absentCount = day.filter((r) => r.status === "Absent").length;
      return {
        date: date.slice(5),
        presentPct: Number(((attended / total) * 100).toFixed(1)),
        latePct: Number(((lateCount / total) * 100).toFixed(1)),
        absentPct: Number(((absentCount / total) * 100).toFixed(1)),
      };
    });
  }, [records]);

  // KPIs: working days from the 1st of the selected month up to that date
  const working = workingDaysInRange(
    `${today.slice(0, 7)}-01`,
    today,
    holidays,
  ).length;
  const localKpis = computeKpis(
    records,
    Math.max(working * new Set(records.map((r) => r.personId)).size, 1),
  );

  const kpis =
    currentUser?.role === "hod" && departmentSummary
      ? {
          ...localKpis,
          attendancePct: departmentSummary.kpi_summary.average_attendance_pct,
          punctualityPct: departmentSummary.kpi_summary.average_punctuality_pct,
        }
      : localKpis;

  const departmentTracking = useMemo(() => {
    return departments.map((d) => {
      const rows = todayRows.filter((r) => r.departmentId === d.id);
      const attended = rows.filter((r) => r.status === "Attended").length;
      const pct = rows.length ? Math.round((attended / rows.length) * 100) : 0;
      const band =
        pct >= 95
          ? "Excellent"
          : pct >= 85
            ? "Good"
            : pct >= 70
              ? "Needs Improvement"
              : "Warning";
      return { ...d, attended, total: rows.length, pct, band };
    });
  }, [departments, todayRows]);

  const trackingPct = Math.round(
    (todayRows.filter((r) => r.status === "Attended").length / totalToday) *
      100,
  );

  const totalLateMinutes = useMemo(
    () => todayRows.reduce((s, r) => s + r.late, 0),
    [todayRows],
  );

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title={`${greeting()}, ${currentUser?.name ? currentUser.name.split(" ")[0] : "User"}`}
        subtitle="Live operational view of fingerprint attendance across RICA offices."
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <DateField
              label="Dashboard date"
              value={today}
              onChange={setToday}
            />
            <Button
              variant="secondary"
              onClick={() => navigate("/reports/daily")}
            >
              Director report
            </Button>
            {currentUser?.role === "admin" && (
              <Button onClick={() => navigate("/upload")}>Upload export</Button>
            )}
          </div>
        }
      />

      <DashboardStats
        present={present}
        late={late}
        absent={absent}
        onLeave={onLeave}
        employeeTotal={employeeTotal}
        totalToday={totalToday}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <AttendanceTrendChart data={trend} />
        <InstitutionKpiCard
          attendancePct={kpis.attendancePct}
          punctualityPct={kpis.punctualityPct}
          band={kpis.band}
        />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
        <DepartmentTrackingCard
          trackingPct={trackingPct}
          departments={departmentTracking}
        />
        <DashboardSidebar
          flags={flags}
          batches={batches}
          totalLateMinutes={totalLateMinutes}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
