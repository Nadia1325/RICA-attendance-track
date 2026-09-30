// src/pages/EmployeesPage/EmployeeFilters.tsx
import { Input, Select } from "../../components/ui";
import type { Employee } from "../../types";

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | Employee["status"];
  onStatusChange: (status: "all" | Employee["status"]) => void;
}

export function EmployeeFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: EmployeeFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search employee name, ID or position…"
      />
      <Select
        className="sm:max-w-xs"
        value={statusFilter}
        onChange={(e) =>
          onStatusChange(e.target.value as "all" | Employee["status"])
        }
      >
        <option value="all">All status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </Select>
    </div>
  );
}
