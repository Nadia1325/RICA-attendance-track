// src/pages/AttendancePage/AttendanceFilters.tsx
import { DateField, Input } from "../../components/ui";

interface AttendanceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function AttendanceFilters({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
}: AttendanceFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        placeholder="Search employee name or Person ID…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <DateField
        label="Attendance date"
        value={selectedDate}
        onChange={onDateChange}
      />
    </div>
  );
}