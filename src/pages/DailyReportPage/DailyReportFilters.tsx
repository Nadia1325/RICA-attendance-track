// src/pages/DailyReportPage/DailyReportFilters.tsx
import { Button, DateField, PageHeader } from "../../components/ui";

interface DailyReportFiltersProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onExport: () => void;
  isExportDisabled?: boolean;
}

export function DailyReportFilters({
  selectedDate,
  onDateChange,
  onExport,
  isExportDisabled,
}: DailyReportFiltersProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Daily report"
        subtitle="Select a date, review the scoped records, and export the report."
        actions={
          <Button onClick={onExport} disabled={isExportDisabled}>
            Export Excel
          </Button>
        }
      />
      <div className="max-w-xs">
        <DateField
          label="Report date"
          value={selectedDate}
          onChange={onDateChange}
        />
      </div>
    </div>
  );
}