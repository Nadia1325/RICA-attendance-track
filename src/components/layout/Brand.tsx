import React from "react";
import { RicaLogo } from "../Brand";

export const Brand: React.FC = () => {
  return (
    <div className="min-w-0 select-none">
      <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 shadow-inner backdrop-blur-md transition-all hover:border-slate-700">
        <RicaLogo className="h-8 w-auto max-w-full drop-shadow-sm" />
      </div>
      <p className="mt-2 text-[11px] font-semibold tracking-wider text-rica-400 uppercase">
        Attendance Management
      </p>
    </div>
  );
};
