// src/pages/RawAttendancePage/RawAttendanceFilters.tsx
import { DateField, Input, MonthField, Select } from "../../components/ui";

interface RawAttendanceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDept: string;
  onDeptChange: (value: string) => void;
  departmentNames: string[];
  mode: "day" | "month" | "year";
  onModeChange: (mode: "day" | "month" | "year") => void;
  date: string;
  onDateChange: (value: string) => void;
  month: string;
  onMonthChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
}

export function RawAttendanceFilters({
  searchQuery,
  onSearchChange,
  selectedDept,
  onDeptChange,
  departmentNames,
  mode,
  onModeChange,
  date,
  onDateChange,
  month,
  onMonthChange,
  year,
  onYearChange,
}: RawAttendanceFiltersProps) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Search employee name, ID, department…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Select value={selectedDept} onChange={(e) => onDeptChange(e.target.value)}>
        <option value="all">All departments</option>
        {departmentNames.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </Select>

      <Select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as "day" | "month" | "year")}
      >
        <option value="day">Daily export</option>
        <option value="month">Monthly export</option>
        <option value="year">Yearly export</option>
      </Select>

      {mode === "day" ? (
        <DateField label="Date" value={date} onChange={onDateChange} />
      ) : mode === "month" ? (
        <MonthField label="Month" value={month} onChange={onMonthChange} />
      ) : (
        <Input
          aria-label="Year"
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
        />
      )}
    </div>
  );
}