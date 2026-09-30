import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps {
  children: ReactNode;
  tone?: "slate" | "teal" | "amber" | "rose" | "emerald" | "sky";
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = "slate" }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-800",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-800",
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-sky-50 text-sky-800",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", map[tone])}>
      {children}
    </span>
  );
};