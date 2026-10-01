import React from "react";
import { RicaLogo } from "../Brand";
import { cn } from "../../lib/utils";

interface BrandProps {
  collapsed?: boolean;
}

export const Brand: React.FC<BrandProps> = ({ collapsed = false }) => {
  return (
    <div className="min-w-0 select-none">
      <div className={cn(
        "flex items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 shadow-inner backdrop-blur-md transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-slate-700",
        collapsed ? "h-10 w-10 justify-center overflow-hidden" : "w-full",
      )}>
        {collapsed ? (
          <span className="text-xl font-black tracking-tight text-rica-500" aria-label="RICA">
            R
          </span>
        ) : (
          <RicaLogo className="h-8 w-auto max-w-full drop-shadow-sm" />
        )}
      </div>
      {!collapsed && (
        <p className="mt-2 text-[11px] font-semibold tracking-wider text-rica-400 uppercase">
          Attendance Management
        </p>
      )}
    </div>
  );
};
