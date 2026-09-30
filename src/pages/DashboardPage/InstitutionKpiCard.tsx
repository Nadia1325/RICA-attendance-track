// src/pages/DashboardPage/InstitutionKpiCard.tsx
import { Card } from "../../components/ui";
import { bandColor } from "../../lib/utils";

interface InstitutionKpiCardProps {
  attendancePct: number;
  punctualityPct: number;
  band: string;
}

export function InstitutionKpiCard({
  attendancePct,
  punctualityPct,
  band,
}: InstitutionKpiCardProps) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-slate-900">Institution KPIs</h2>
      <p className="mt-1 text-xs text-slate-500">
        Organization-wide performance percentages
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex justify-between text-sm">
            <span>Attendance</span>
            <span className="font-semibold">{attendancePct.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-teal-600"
              style={{ width: `${Math.min(100, attendancePct)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span>Punctuality</span>
            <span className="font-semibold">{punctualityPct.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-sky-600"
              style={{ width: `${Math.min(100, punctualityPct)}%` }}
            />
          </div>
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${bandColor(
            band,
          )}`}
        >
          Band: {band}
        </div>

        <p className="text-xs text-slate-500">
          Department circles: ≥95% Excellent · 85–94% Good · 70–84% Needs
          Improvement · &lt;70% Warning.
        </p>
      </div>
    </Card>
  );
}
