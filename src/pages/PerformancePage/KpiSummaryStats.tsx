// src/pages/PerformancePage/KpiSummaryStats.tsx
import { Stat } from "../../components/ui";

interface KpiSummaryStatsProps {
  avgAttendance: number;
  avgPunctuality: number;
  warningsCount: number;
}

export function KpiSummaryStats({
  avgAttendance,
  avgPunctuality,
  warningsCount,
}: KpiSummaryStatsProps) {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Stat label="Avg attendance" value={`${avgAttendance.toFixed(1)}%`} />
      <Stat label="Avg punctuality" value={`${avgPunctuality.toFixed(1)}%`} />
      <Stat
        label="Warning band"
        value={warningsCount}
        hint="Below 70% attendance"
        accent="text-rose-700"
      />
    </div>
  );
}
