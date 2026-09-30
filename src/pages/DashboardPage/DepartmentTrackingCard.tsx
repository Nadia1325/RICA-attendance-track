// src/pages/DashboardPage/DepartmentTrackingCard.tsx
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Badge, Card } from "../../components/ui";
import type { Department } from "../../types";

export type DepartmentTrackItem = Department & {
  attended: number;
  total: number;
  pct: number;
  band: string;
};

interface DepartmentTrackingCardProps {
  trackingPct: number;
  departments: DepartmentTrackItem[];
}

export function DepartmentTrackingCard({
  trackingPct,
  departments,
}: DepartmentTrackingCardProps) {
  const donutData = [
    { name: "Attendance", value: trackingPct },
    { name: "Remaining", value: 100 - trackingPct },
  ];

  const bandFill = (band: string) =>
    band === "Excellent"
      ? "#059669"
      : band === "Good"
        ? "#0284c7"
        : band === "Needs Improvement"
          ? "#d97706"
          : "#e11d48";

  return (
    <Card className="min-w-0 p-4 sm:p-5 xl:col-span-2">
      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">Department tracking</h2>
          <p className="text-xs leading-5 text-slate-500">
            Circular organization attendance rate with department breakdown
          </p>
        </div>
        <Badge tone="teal">{trackingPct}%</Badge>
      </div>

      <div className="grid min-w-0 items-center gap-5 xl:grid-cols-[190px_minmax(0,1fr)]">
        <div className="relative mx-auto h-44 w-44 max-w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={56}
                outerRadius={76}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#0f766e" : "#e2e8f0"} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">
              {trackingPct}%
            </span>
            <span className="text-[11px] text-slate-500">attendance</span>
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {departments.map((d) => {
            const data = [
              { name: "Performance", value: d.pct },
              { name: "Remaining", value: 100 - d.pct },
            ];
            const fill = bandFill(d.band);

            return (
              <div
                key={d.id}
                className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2"
              >
                <div className="relative h-14 w-14 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={18}
                        outerRadius={25}
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? fill : "#e2e8f0"} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800">
                    {d.pct}%
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-xs font-semibold leading-4 text-slate-800">
                    {d.code} · {d.name}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    {d.attended}/{d.total} present
                  </p>
                  <span
                    className="mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ring-1"
                    style={{
                      color: fill,
                      backgroundColor: `${fill}12`,
                      borderColor: `${fill}40`,
                    }}
                  >
                    {d.band}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
