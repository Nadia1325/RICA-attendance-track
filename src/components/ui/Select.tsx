import React, { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select: React.FC<SelectProps> = (props) => {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-teal-600/20 focus:ring-4",
        props.className
      )}
    />
  );
};