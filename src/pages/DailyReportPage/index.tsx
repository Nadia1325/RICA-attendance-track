// src/pages/DailyReportPage/index.tsx
import { useMemo, useState } from "react";
import { exportWorkbook } from "../../lib/excel";
import {
  errorMessage,
  mapDepartment,
  useGetDailyReportQuery,
  useGetDepartmentsQuery,
  useMeQuery,
} from "../../services";

import { DailyReportFilters } from "./DailyReportFilters";
import { DailyReportTable, type ReportRow } from "./DailyReportTable";

export function DailyReportPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // RTK Query API calls
  const { data: rawMe } = useMeQuery();
  const { data: rawDepartments = [] } = useGetDepartmentsQuery();

  const {
    data: dailyData,
    isLoading,
    error,
    refetch,
  } = useGetDailyReportQuery(date, {
    skip: !rawMe || !date,
  });

  // Mapped departments lookup
  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments]
  );

  // Map API report rows into standard format
  const report = useMemo<ReportRow[]>(() => {
    const rawRows = (dailyData?.rows ?? []) as Record<string, unknown>[];
    return rawRows.map((r, i) => {
      const deptId = String(r.department_id ?? r.departmentId ?? "");
      const deptName =
        departments.find((d) => d.id === deptId)?.name ??
        String(r.Department ?? r.department ?? "");

      return {
        No: Number(r["No."] ?? r.no ?? i + 1),
        Name: String(r.Name ?? r.name ?? r.full_name ?? ""),
        "Person ID": String(r.person_id ?? r.personId ?? ""),
        Department: deptName,
        Date: String(r.Date ?? r.date ?? date),
        Week: String(r.Week ?? r.week ?? ""),
        Timetable: String(r.Timetable ?? r.timetable ?? ""),
        "Check-in": String(r["Check-in"] ?? r.check_in ?? r.checkIn ?? "—"),
        "Check-out": String(r["Check-out"] ?? r.check_out ?? r.checkOut ?? "—"),
        Status: String(r.status ?? r.Status ?? ""),
      };
    });
  }, [dailyData, date, departments]);

  const handleExport = () => {
    if (report.length === 0) return;
    exportWorkbook(`RICA_daily_${date}.xlsx`, report);
  };

  return (
    <div className="min-w-0 space-y-4">
      <DailyReportFilters
        selectedDate={date}
        onDateChange={setDate}
        onExport={handleExport}
        isExportDisabled={report.length === 0 || isLoading}
      />

      <DailyReportTable
        rows={report}
        isLoading={isLoading}
        error={error}
        errorMessage={error ? errorMessage(error) : undefined}
        onRetry={refetch}
      />
    </div>
  );
}

export default DailyReportPage;