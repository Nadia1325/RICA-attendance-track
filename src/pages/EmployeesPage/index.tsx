// src/pages/EmployeesPage/index.tsx
import { useMemo, useState } from "react";
import { PageHeader } from "../../components/ui";
import {
  errorMessage,
  mapDepartment,
  mapEmployee,
  mapShift,
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
  useGetShiftsQuery,
} from "../../services";
import type { Employee } from "../../types";

import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";

export function EmployeesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Employee["status"]>("all");

  // RTK Query API Fetching
  const {
    data: rawEmployees = [],
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery();

  const { data: rawDepartments = [] } = useGetDepartmentsQuery();
  const { data: rawShifts = [] } = useGetShiftsQuery();

  // Mapped domain entities
  const people = useMemo(() => rawEmployees.map(mapEmployee), [rawEmployees]);
  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );
  const shifts = useMemo(() => rawShifts.map(mapShift), [rawShifts]);

  // Client-side filtering logic
  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return people.filter((e) => {
      const matchesSearch = `${e.name} ${e.personId} ${e.position}`
        .toLowerCase()
        .includes(query);
      const matchesStatus = status === "all" || e.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [people, q, status]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employee master"
        subtitle="Employee records come from the RICA attendance system, limited to your access scope."
      />

      <EmployeeFilters
        searchQuery={q}
        onSearchChange={setQ}
        statusFilter={status}
        onStatusChange={setStatus}
      />

      <EmployeeTable
        employees={filtered}
        departments={departments}
        shifts={shifts}
        isLoading={isLoadingEmployees}
        error={employeesError}
        errorMessage={employeesError ? errorMessage(employeesError) : undefined}
        onRetry={refetchEmployees}
      />

      <p className="mt-3 text-xs text-slate-400">
        Showing {filtered.length} of {people.length} employees.
      </p>
    </div>
  );
}

export default EmployeesPage;
