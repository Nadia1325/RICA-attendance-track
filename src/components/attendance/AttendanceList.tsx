import React from "react";
import { useGetAttendanceQuery } from "../../features/attendance/attendanceApi";
import { Card, PageHeader } from "../ui";

export const AttendanceList: React.FC = () => {
  const { data, isLoading, isError, error } = useGetAttendanceQuery();

  if (isLoading) return <p className="p-4 text-slate-500">Loading attendance data...</p>;
  if (isError) return <p className="p-4 text-rose-600">Error loading attendance: {JSON.stringify(error)}</p>;

  return (
    <div>
      <PageHeader title="Attendance Records" subtitle="Real-time backend data via Redux Toolkit Query" />
      <div className="grid gap-4">
        {data?.finals.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{record.name}</p>
                <p className="text-xs text-slate-500">{record.date} | {record.timetable}</p>
              </div>
              <span className="text-sm font-medium text-teal-700">{record.status}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};