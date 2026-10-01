
import React, { type ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};