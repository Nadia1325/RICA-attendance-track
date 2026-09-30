import React from "react";
import { useGetRawAttendanceQuery } from "../../services/attendanceApi";
import { Card, PageHeader } from "../ui";

export const AttendanceList: React.FC = () => {
  const { data = [], isLoading, isError, error } = useGetRawAttendanceQuery();

  if (isLoading)
    return <p className="p-4 text-slate-500">Loading attendance data...</p>;
  if (isError)
    return <p className="p-4 text-rose-600">Error: {JSON.stringify(error)}</p>;

  return (
    <div>
      <PageHeader
        title="Attendance Records"
        subtitle="Raw imports from fingerprint device"
      />
      <div className="grid gap-4">
        {data.map((record, idx) => (
          <Card key={record.id ?? idx} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900">{record.name}</p>
                <p className="text-xs text-slate-500">
                  {record.date} | {record.timetable}
                </p>
              </div>
              <span className="text-sm font-medium text-teal-700">
                {record.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
