import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
};