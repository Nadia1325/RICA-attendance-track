// src/pages/DashboardPage/DashboardSidebar.tsx
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card } from "../../components/ui";
import { formatMinutes } from "../../lib/utils";
import type { Anomaly, Batch } from "../../types";

interface DashboardSidebarProps {
  flags: Anomaly[];
  batches: Batch[];
  totalLateMinutes: number;
}

export function DashboardSidebar({
  flags,
  batches,
  totalLateMinutes,
}: DashboardSidebarProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Open anomalies</h2>
        <Button variant="ghost" onClick={() => navigate("/verification")}>
          Review queue
        </Button>
      </div>

      <div className="space-y-3">
        {flags.slice(0, 5).map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{a.name}</p>
              <Badge tone={a.severity === "high" ? "rose" : "amber"}>
                {a.severity}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {a.date} · {a.message}
            </p>
          </div>
        ))}

        {flags.length === 0 && (
          <p className="text-sm text-slate-500">No open flags in your scope.</p>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-semibold">Recent batches</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {batches.slice(0, 3).map((b) => (
            <li key={b.id} className="flex justify-between">
              <span className="text-slate-700">{b.id}</span>
              <span className="text-slate-500">{b.rowCount} rows</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Late minutes today (sample): {formatMinutes(totalLateMinutes)}
      </p>
    </Card>
  );
}
