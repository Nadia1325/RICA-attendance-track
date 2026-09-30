// src/pages/DashboardPage/DashboardStats.tsx
import { Stat } from "../../components/ui";

interface DashboardStatsProps {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  employeeTotal: number;
  totalToday: number;
}

export function DashboardStats({
  present,
  late,
  absent,
  onLeave,
  employeeTotal,
  totalToday,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Present today"
        value={`${present}/${employeeTotal}`}
        hint={`${Math.round((present / totalToday) * 100)}% of scoped employees`}
        accent="text-teal-800"
      />
      <Stat
        label="Late arrivals"
        value={late}
        hint={`${Math.round((late / totalToday) * 100)}% of scoped employees · after grace period`}
        accent="text-amber-700"
      />
      <Stat
        label="Absent"
        value={absent}
        hint={`${Math.round((absent / totalToday) * 100)}% of scoped employees · no valid punch`}
        accent="text-rose-700"
      />
      <Stat
        label="On leave"
        value={onLeave}
        hint={`${onLeave} employees on leave`}
      />
    </div>
  );
}
