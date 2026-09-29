import React, { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-teal-600/20 focus:ring-4",
        props.className
      )}
    />
  );
};