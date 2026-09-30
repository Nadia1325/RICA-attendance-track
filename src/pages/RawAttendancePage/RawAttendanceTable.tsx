import { Badge, Card } from "../../components/ui";

// Ensure 'export' keyword is present here
export interface RawAttendanceRow {
  id: string;
  no: number | string;
  personId: string;
  name: string;
  department: string;
  position: string;
  gender: string;
  date: string;
  week: string;
  timetable: string;
  checkIn: string;
  checkOut: string;
  work: string | number;
  ot: string | number;
  attended: string | number;
  late: string | number;
  early: string | number;
  absent: string | number;
  leave: string | number;
  status: string;
  records: string | number;
  batchId: string;
}

interface RawAttendanceTableProps {
  rows: RawAttendanceRow[];
  isLoading?: boolean;
}

const TABLE_HEADINGS = [
  "No.",
  "Person ID",
  "Name",
  "Department",
  "Position",
  "Gender",
  "Date",
  "Week",
  "Timetable",
  "Check-in",
  "Check-out",
  "Work",
  "OT",
  "Attended",
  "Late",
  "Early",
  "Absent",
  "Leave",
  "Status",
  "Records",
  "Batch",
];

export function RawAttendanceTable({
  rows,
  isLoading,
}: RawAttendanceTableProps) {
  return (
    <Card className="overflow-auto">
      <table className="w-full min-w-[1450px] text-left text-xs">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            {TABLE_HEADINGS.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td
                colSpan={21}
                className="px-4 py-12 text-center text-slate-500"
              >
                Loading raw device logs from backend...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={21}
                className="px-4 py-12 text-center text-slate-500"
              >
                No raw attendance records match the selected filters.
              </td>
            </tr>
          ) : (
            rows.slice(0, 500).map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-3 py-2">{r.no}</td>
                <td className="px-3 py-2 font-mono text-slate-700">
                  {r.personId}
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">
                  {r.name}
                </td>
                <td className="px-3 py-2 text-slate-600">{r.department}</td>
                <td className="px-3 py-2 text-slate-600">{r.position}</td>
                <td className="px-3 py-2 text-slate-600">{r.gender}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                  {r.date}
                </td>
                <td className="px-3 py-2 text-slate-600">{r.week}</td>
                <td className="px-3 py-2 text-slate-600">{r.timetable}</td>
                <td className="px-3 py-2 text-slate-600">{r.checkIn || "—"}</td>
                <td className="px-3 py-2 text-slate-600">
                  {r.checkOut || "—"}
                </td>
                <td className="px-3 py-2 text-slate-600">{r.work}</td>
                <td className="px-3 py-2 text-slate-600">{r.ot}</td>
                <td className="px-3 py-2 text-slate-600">{r.attended}</td>
                <td className="px-3 py-2 text-slate-600">{r.late}</td>
                <td className="px-3 py-2 text-slate-600">{r.early}</td>
                <td className="px-3 py-2 text-slate-600">{r.absent}</td>
                <td className="px-3 py-2 text-slate-600">{r.leave}</td>
                <td className="px-3 py-2">
                  <Badge
                    tone={
                      r.status === "Absent"
                        ? "rose"
                        : r.status === "LV" || r.status === "Leave"
                          ? "sky"
                          : "teal"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-slate-600">
                  {r.records}
                </td>
                <td className="px-3 py-2 text-slate-600">{r.batchId}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
