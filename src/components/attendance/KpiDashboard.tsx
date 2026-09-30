// src/components/attendance/KpiDashboard.tsx
import React from "react";
import { useGetRawAttendanceQuery } from "../../services/attendanceApi";
import { useGetHolidaysQuery } from "../../services/referenceApi";
import { workingDaysInRange, computeKpis } from "../../lib/kpis";
import { mapRaw } from "../../services/mappers";

export const KpiDashboard: React.FC = () => {
  const { data: rawRecords = [] } = useGetRawAttendanceQuery();
  const { data: holidays = [] } = useGetHolidaysQuery();

  const records = rawRecords.map(mapRaw);
  const workingDays = workingDaysInRange(
    "2026-09-01",
    "2026-09-30",
    holidays as any,
  );
  const kpis = computeKpis(records as any, workingDays.length);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <p className="text-sm text-slate-500">Attendance Rate</p>
        <p className="text-2xl font-bold">{kpis.attendancePct.toFixed(1)}%</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <p className="text-sm text-slate-500">Punctuality Rate</p>
        <p className="text-2xl font-bold">{kpis.punctualityPct.toFixed(1)}%</p>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <p className="text-sm text-slate-500">Performance Band</p>
        <p className="text-2xl font-bold text-teal-600">{kpis.band}</p>
      </div>
    </div>
  );
};
