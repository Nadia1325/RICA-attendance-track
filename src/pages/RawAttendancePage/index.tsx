import { useMemo, useState } from "react";
import { Button, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { exportWorkbook } from "../../lib/excel";

// Separate runtime functions/objects from types
import {
  errorMessage,
  useGetDailyAttendanceRawQuery,
} from "../../services/api";

import { RawAttendanceFilters } from "./RawAttendanceFilters";

// Use 'import type' for RawAttendanceRow
import { RawAttendanceTable } from "./RawAttendanceTable";
import type { RawAttendanceRow } from "./RawAttendanceTable";

type ApiRawRecord = {
  id?: string;
  no?: number | string;
  person_id?: string;
  personId?: string;
  name?: string;
  department?: string;
  position?: string;
  gender?: string;
  date?: string;
  week?: string;
  timetable?: string;
  check_in?: string;
  checkIn?: string;
  check_out?: string;
  checkOut?: string;
  work?: string | number;
  ot?: string | number;
  attended?: string | number;
  late?: string | number;
  early?: string | number;
  absent?: string | number;
  leave?: string | number;
  status?: string;
  records?: string | number;
  batch_id?: string;
  batchId?: string;
};

export function RawAttendancePage() {
  const { currentUser, departments } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [mode, setMode] = useState<"day" | "month" | "year">("day");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [month, setMonth] = useState(todayStr.slice(0, 7));
  const [year, setYear] = useState(todayStr.slice(0, 4));

  // Determine active query period based on selection
  const rawQ = useGetDailyAttendanceRawQuery(
    { date, month, year, mode, take: 500, skip: 0 },
    { refetchOnMountOrArgChange: true },
  );

  const rawApiData = (rawQ.data as ApiRawRecord[] | undefined) ?? [];
  const isLoading = rawQ.isLoading || rawQ.isFetching;
  const errorMsg = rawQ.isError
    ? errorMessage(rawQ.error, "Failed to load raw attendance records.")
    : "";

  // Normalize departments against available department definitions
  const canonicalNames = useMemo(
    () =>
      new Map(
        departments.map((department) => [
          department.name.trim().toLowerCase(),
          department.name.trim(),
        ]),
      ),
    [departments],
  );

  const normalizedRaw: RawAttendanceRow[] = useMemo(() => {
    return rawApiData.map((row, index) => {
      const deptName = row.department?.trim() ?? "";
      const matchedDept =
        canonicalNames.get(deptName.toLowerCase()) ?? deptName;

      return {
        id:
          row.id ??
          `${row.person_id || row.personId || index}-${row.date}-${index}`,
        no: row.no ?? index + 1,
        personId: row.person_id ?? row.personId ?? "",
        name: row.name ?? "",
        department: matchedDept,
        position: row.position ?? "",
        gender: row.gender ?? "",
        date: row.date ?? "",
        week: row.week ?? "",
        timetable: row.timetable ?? "",
        checkIn: row.check_in ?? row.checkIn ?? "",
        checkOut: row.check_out ?? row.checkOut ?? "",
        work: row.work ?? 0,
        ot: row.ot ?? 0,
        attended: row.attended ?? 0,
        late: row.late ?? 0,
        early: row.early ?? 0,
        absent: row.absent ?? 0,
        leave: row.leave ?? 0,
        status: row.status ?? "Present",
        records: row.records ?? 0,
        batchId: row.batch_id ?? row.batchId ?? "",
      };
    });
  }, [rawApiData, canonicalNames]);

  const departmentNames = useMemo(
    () =>
      [
        ...new Set([
          ...departments.map((d) => d.name.trim()),
          ...normalizedRaw.map((r) => r.department),
        ]),
      ]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [departments, normalizedRaw],
  );

  // Perform client-side filter for search, department, and selected period scope
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return normalizedRaw.filter((r) => {
      const matchesSearch =
        !q ||
        `${r.name} ${r.personId} ${r.department} ${r.status}`
          .toLowerCase()
          .includes(q);

      const matchesDept =
        selectedDept === "all" || r.department === selectedDept;

      // Extract standard YYYY-MM-DD prefix from ISO string or standard raw strings
      const rawDateStr = String(r.date || "").trim();
      const cleanRowDate = rawDateStr.includes("T")
        ? rawDateStr.split("T")[0]
        : rawDateStr.slice(0, 10);

      const matchesPeriod =
        !rawDateStr || // Display all rows if backend omits specific date strings
        (mode === "day"
          ? cleanRowDate === date || rawDateStr.includes(date)
          : mode === "month"
            ? cleanRowDate.startsWith(month) || rawDateStr.includes(month)
            : cleanRowDate.startsWith(year) || rawDateStr.includes(year));

      return matchesSearch && matchesDept && matchesPeriod;
    });
  }, [normalizedRaw, searchQuery, selectedDept, mode, date, month, year]);

  const handleExport = () => {
    const exportRows = filteredRows.map((r) => ({
      No: r.no,
      "Person ID": r.personId,
      Name: r.name,
      Department: r.department,
      Position: r.position,
      Gender: r.gender,
      Date: r.date,
      Week: r.week,
      Timetable: r.timetable,
      "Check-in": r.checkIn,
      "Check-out": r.checkOut,
      Work: r.work,
      OT: r.ot,
      Attended: r.attended,
      Late: r.late,
      Early: r.early,
      Absent: r.absent,
      Leave: r.leave,
      Status: r.status,
      Records: r.records,
      Batch: r.batchId,
    }));

    const exportPeriodTag =
      mode === "day" ? date : mode === "month" ? month : year;
    exportWorkbook(`RICA_raw_${mode}_${exportPeriodTag}.xlsx`, exportRows);
  };

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Raw attendance"
        subtitle="Review exact fingerprint-device rows directly from backend logs, filter by employee or department, and export daily, monthly, or yearly reports."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} disabled={filteredRows.length === 0}>
              Export {mode}
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {errorMsg}
        </p>
      )}

      <RawAttendanceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        departmentNames={departmentNames}
        mode={mode}
        onModeChange={setMode}
        date={date}
        onDateChange={setDate}
        month={month}
        onMonthChange={setMonth}
        year={year}
        onYearChange={setYear}
      />

      <RawAttendanceTable rows={filteredRows} isLoading={isLoading} />

      <p className="mt-2 text-xs text-slate-400">
        Showing {Math.min(500, filteredRows.length)} of {filteredRows.length}{" "}
        matching rows.
      </p>
    </div>
  );
}

export default RawAttendancePage;
