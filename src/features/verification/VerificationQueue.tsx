import { Badge, Card, DateField, Input } from "../../components/ui"

interface Anomaly {
  id: string;
  attendanceId: string;
  personId: string;
  name: string;
  message: string;
  type: string;
  severity: "high" | "medium" | "low" | string;
  date: string;
  departmentId: string;
  resolved: boolean;
}

interface VerificationQueueProps {
  open: Anomaly[];
  filteredOpen: Anomaly[];
  selected: string;
  q: string;
  date: string;
  departments: Array<{ id: string; name: string }>;
  onSearchChange: (q: string) => void;
  onDateChange: (date: string) => void;
  onSelect: (attendanceId: string) => void;
}

export function VerificationQueue({
  open,
  filteredOpen,
  selected,
  q,
  date,
  departments,
  onSearchChange,
  onDateChange,
  onSelect,
}: VerificationQueueProps) {
  return (
    <Card className="lg:col-span-2">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-semibold">{open.length} open flags</div>
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Search name, ID or issue…"
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <DateField label="Filter by date" value={date} onChange={onDateChange} />
        </div>
      </div>

      <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-auto">
        {filteredOpen.map((a) => (
          <li key={a.id}>
            <button
              onClick={() => onSelect(a.attendanceId)}
              className={`w-full px-4 py-3 text-left text-sm ${
                selected === a.attendanceId ? "bg-teal-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{a.name}</span>
                <Badge tone={a.severity === "high" ? "rose" : "amber"}>
                  {a.type.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {a.date} · {departments.find((d) => d.id === a.departmentId)?.name}
              </p>
              <p className="mt-1 text-xs text-slate-600">{a.message}</p>
            </button>
          </li>
        ))}
        {filteredOpen.length === 0 && (
          <li className="p-6 text-sm text-slate-500">No matching verification records.</li>
        )}
      </ul>
    </Card>
  );
}