import React from "react";
import { Card } from "./Card";
import { cn } from "../../lib/utils";

export interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
}

export const Stat: React.FC<StatProps> = ({ label, value, hint, accent }) => {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-2 text-xl font-bold sm:text-2xl", accent ?? "text-slate-900")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
};