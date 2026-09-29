import React from "react";
import { cn } from "../../lib/utils";

export interface MonthFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const MonthField: React.FC<MonthFieldProps> = ({
  label,
  value,
  onChange,
  className,
}) => {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>}
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none ring-teal-700/25 focus:ring-4 accent-teal-700"
      />
    </label>
  );
};