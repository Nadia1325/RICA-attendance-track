// src/pages/PerformancePage/index.tsx
import { useMemo, useState } from "react";
import { PageHeader, Select } from "../../components/ui";
import { useApp } from "../../data/store";
import { computeKpis, workingDaysInRange } from "../../lib/kpis";
import {
  errorMessage,
  useGetKpisQuery,
  useGetPeriodReportQuery,
} from "../../services/api";

import {
  DepartmentBarChart,
  type DepartmentChartData,
} from "./DepartmentBarChart";
import {
  EmployeeKpiTable,
  type EmployeeKpiRow,
} from "./EmployeeKpiTable";
import { KpiSummaryStats } from "./KpiSummaryStats";
import { PerformanceGauges } from "./PerformanceGauges";
import {
  PeriodRecordsTable,
  type RemotePeriodRow,
} from "./PeriodRecordsTable";

type RemoteKpi = {
  summary: {
    average_attendance_pct: number;
    average_punctuality_pct: number;
  };
  employees: {
    employee_id: string;
    person_id: string;
    name: string;
    department: string;
    working_days: number;
    days_present: number;
    days_late: number;
    attendance_pct: number;
    punctuality_pct: number;
    rating: string;
  }[];
};

export function PerformancePage() {
  const { scopedFinals, scopedEmployees, holidays, departments, currentUser } =
    useApp();
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  const reportArgs = { period, year, month, quarter };

  const kpiQ = useGetKpisQuery(reportArgs, { skip: !currentUser });
  const periodQ = useGetPeriodReportQuery(reportArgs, { skip: !currentUser });

  const remote = (kpiQ.data as RemoteKpi | undefined) ?? null;
  const periodRows =
    (periodQ.data?.rows as RemotePeriodRow[] | undefined) ?? null;

  const reportError =
    kpiQ.isError || periodQ.isError
      ? errorMessage(kpiQ.error ?? periodQ.error, "Unable to load KPI report.")
      : "";

  const all = scopedFinals();
  const today = now.toISOString().slice(0, 10);
  const startMonth =
    period === "year"
      ? 1
      : period === "quarter"
      ? (quarter - 1) * 3 + 1
      : month;

  const range = {
    start: `${year}-${String(startMonth).padStart(2, "0")}-01`,
    end: today,
  };

  const people = scopedEmployees();
  const rows = all.filter((r) => r.date >= range.start && r.date <= range.end);
  const imported = [...new Set(rows.map((r) => r.date))].sort();
  const workDays = workingDaysInRange(
    imported[0] ?? range.start,
    imported[imported.length - 1] ?? range.end,
    holidays
  );

  const localTable = useMemo(
    () =>
      people
        .map((emp) => {
          const rec = rows.filter((r) => r.personId === emp.personId);
          const k = computeKpis(rec, workDays.length);
          return {
            emp,
            ...k,
            dept:
              departments.find((d) => d.id === emp.departmentId)?.name ?? "",
          };
        })
        .sort((a, b) => b.attendancePct - a.attendancePct),
    [people, rows, workDays.length, departments]
  );

  const avgAtt =
    remote?.summary.average_attendance_pct ??
    (localTable.length
      ? localTable.reduce((s, r) => s + r.attendancePct, 0) / localTable.length
      : 0);

  const avgPun =
    remote?.summary.average_punctuality_pct ??
    (localTable.length
      ? localTable.reduce((s, r) => s + r.punctualityPct, 0) /
        localTable.length
      : 0);

  const warnings = remote
    ? remote.employees.filter((r) => r.rating === "Warning").length
    : localTable.filter((r) => r.band === "Warning").length;

  const chartData: DepartmentChartData[] = useMemo(() => {
    return departments.map((d) => {
      if (remote) {
        const subset = remote.employees.filter(
          (employee) => employee.department === d.name
        );
        const avgAtt = subset.length
          ? subset.reduce((s, e) => s + e.attendance_pct, 0) / subset.length
          : 0;
        const avgPun = subset.length
          ? subset.reduce((s, e) => s + e.punctuality_pct, 0) / subset.length
          : 0;
        return {
          name: d.code,
          attendance: Number(avgAtt.toFixed(1)),
          punctuality: Number(avgPun.toFixed(1)),
        };
      }
      const subset = localTable.filter((t) => t.emp.departmentId === d.id);
      const avgAtt = subset.length
        ? subset.reduce((s, r) => s + r.attendancePct, 0) / subset.length
        : 0;
      const avgPun = subset.length
        ? subset.reduce((s, r) => s + r.punctualityPct, 0) / subset.length
        : 0;
      return {
        name: d.code,
        attendance: Number(avgAtt.toFixed(1)),
        punctuality: Number(avgPun.toFixed(1)),
      };
    });
  }, [departments, remote, localTable]);

  const mappedEmployeeRows: EmployeeKpiRow[] = useMemo(() => {
    if (remote) {
      return remote.employees.map((r) => ({
        id: r.employee_id,
        name: r.name,
        department: r.department,
        present: r.days_present,
        workingDays: r.working_days,
        attendancePct: r.attendance_pct,
        punctualityPct: r.punctuality_pct,
        band: r.rating,
      }));
    }
    return localTable.map((r) => ({
      id: r.emp.id,
      name: r.emp.name,
      department: r.dept,
      present: r.present,
      workingDays: r.workingDays,
      attendancePct: r.attendancePct,
      punctualityPct: r.punctualityPct,
      band: r.band,
    }));
  }, [remote, localTable]);

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Performance KPIs"
        subtitle="Track attendance and punctuality over monthly, quarterly, and yearly windows."
        actions={
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="w-40"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
            <option value="year">Yearly</option>
          </Select>
        }
      />

      {reportError && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {reportError}
        </p>
      )}

      <KpiSummaryStats
        avgAttendance={avgAtt}
        avgPunctuality={avgPun}
        warningsCount={warnings}
      />

      <PerformanceGauges avgAttendance={avgAtt} avgPunctuality={avgPun} />

      <DepartmentBarChart data={chartData} />

      <EmployeeKpiTable rows={mappedEmployeeRows} />

      {periodRows !== null && (
        <PeriodRecordsTable period={period} rows={periodRows} />
      )}
    </div>
  );
}

export default PerformancePage;