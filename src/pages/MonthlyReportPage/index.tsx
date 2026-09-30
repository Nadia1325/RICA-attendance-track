// src/pages/MonthlyReportPage/index.tsx
import { useMemo, useState } from "react";
import { Badge, Button, MonthField, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { exportWorkbook } from "../../lib/excel";
import { computeKpis, workingDaysInRange } from "../../lib/kpis";
import { errorMessage, useGetMonthlyReportQuery } from "../../services/api";
import type { AttendanceFinal } from "../../types/types";

import { MonthlyReportTable, type SummaryRow } from "./MonthlyReportTable";
import {
  formatDateLocal,
  transformApiRowToAttendance,
  type ApiAttendanceRow,
} from "./utils";

export function MonthlyReportPage() {
  const { scopedFinals, scopedEmployees, holidays, departments, currentUser } =
    useApp();
  const people = scopedEmployees();
  const rows = scopedFinals();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [year, mon] = month.split("-").map(Number);

  const start = `${month}-01`;
  const end = useMemo(() => {
    return formatDateLocal(new Date(year, mon, 0));
  }, [year, mon]);

  const workDays = useMemo(
    () => workingDaysInRange(start, end, holidays),
    [start, end, holidays]
  );

  const monthly = useGetMonthlyReportQuery(
    { year, month: mon },
    { skip: !currentUser || !year || !mon }
  );

  const remoteRows: ApiAttendanceRow[] | null = monthly.isSuccess
    ? monthly.data.rows ?? []
    : null;

  const reportError = monthly.isError
    ? errorMessage(monthly.error, "Unable to load the monthly report.")
    : "";

  const departmentMap = useMemo(() => {
    return new Map<string, string>(departments.map((d) => [d.id, d.name]));
  }, [departments]);

  const summary: SummaryRow[] = useMemo(() => {
    return people.map((emp) => {
      const rec: AttendanceFinal[] =
        remoteRows !== null
          ? remoteRows
              .filter((r) => String(r.person_id ?? "") === emp.personId)
              .map((r, index) => transformApiRowToAttendance(r, emp, index))
          : rows.filter(
              (r) =>
                r.personId === emp.personId &&
                r.date >= start &&
                r.date <= end
            );

      const k = computeKpis(rec, workDays.length);

      return {
        Name: emp.name,
        "Person ID": emp.personId,
        Department: departmentMap.get(emp.departmentId ?? "") ?? "",
        "Working days": k.workingDays,
        Present: k.present,
        Late: k.lateDays,
        "Attendance %": Number(k.attendancePct.toFixed(1)),
        "Punctuality %": Number(k.punctualityPct.toFixed(1)),
        Band: k.band,
        "Late minutes": rec.reduce((sum, r) => sum + r.late, 0),
      };
    });
  }, [people, remoteRows, rows, start, end, workDays.length, departmentMap]);

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Monthly report"
        subtitle="Choose the reporting month and export the department scoped summary."
        actions={
          <Button
            onClick={() =>
              exportWorkbook(`RICA_monthly_${month}.xlsx`, summary)
            }
          >
            Export Excel
          </Button>
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

      <div className="max-w-xs">
        <MonthField
          label="Reporting month"
          value={month}
          onChange={setMonth}
        />
      </div>

      <MonthlyReportTable
        summary={summary}
        isLoading={monthly.isLoading}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <Badge tone="emerald">≥95% Excellent</Badge>
        <Badge tone="sky">85–94% Good</Badge>
        <Badge tone="amber">70–84% Needs improvement</Badge>
        <Badge tone="rose">&lt;70% Warning</Badge>
      </div>
    </div>
  );
}

export default MonthlyReportPage;