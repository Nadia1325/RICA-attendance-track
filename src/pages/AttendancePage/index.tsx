// src/pages/AttendancePage/index.tsx
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/ui";
import {
  errorMessage,
  mapDepartment,
  mapEmployee,
  mapFinal,
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
  useGetFinalAttendanceQuery,
} from "../../services";

import { AttendanceFilters } from "./AttendanceFilters";
import { AttendanceTable } from "./AttendanceTable";

export function AttendancePage() {
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  // RTK Query hooks
  const {
    data: rawFinals = [],
    isLoading: isLoadingFinals,
    error: finalsError,
    refetch,
  } = useGetFinalAttendanceQuery();

  const { data: rawDepartments = [] } = useGetDepartmentsQuery();
  const { data: rawEmployees = [] } = useGetEmployeesQuery();

  // Mapped departments lookup
  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );

  // Mapped employees map
  const employeeMap = useMemo(() => {
    const map = new Map();
    rawEmployees.forEach((e) => {
      const emp = mapEmployee(e);
      map.set(emp.personId, emp);
    });
    return map;
  }, [rawEmployees]);

  // Mapped final records
  const rows = useMemo(() => {
    return rawFinals.map((r) => mapFinal(r, employeeMap));
  }, [rawFinals, employeeMap]);

  // Filtered rows
  const filteredRecords = useMemo(() => {
    const query = q.toLowerCase().trim();
    return rows.filter((r) => {
      const matchesSearch = `${r.name} ${r.personId} ${r.status}`
        .toLowerCase()
        .includes(query);
      const matchesDate = !date || r.date === date;
      return matchesSearch && matchesDate;
    });
  }, [rows, q, date]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Verified attendance"
        subtitle="Final database after HR/unit review. Search by employee or ID and use the calendar to inspect a specific day."
      />

      <AttendanceFilters
        searchQuery={q}
        onSearchChange={setQ}
        selectedDate={date}
        onDateChange={setDate}
      />

      <AttendanceTable
        records={filteredRecords}
        departments={departments}
        isLoading={isLoadingFinals}
        error={finalsError}
        errorMessage={finalsError ? errorMessage(finalsError) : undefined}
        onRetry={refetch}
      />
    </div>
  );
}

export default AttendancePage;
