import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  ...props
}) => {
  const styles = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 shadow-sm",
    secondary: "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    outline: "border border-teal-700 text-teal-800 hover:bg-teal-50",
  }[variant];

  return (
    <button
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 sm:text-sm",
        styles,
        className
      )}
      {...props}
    />
  );
};