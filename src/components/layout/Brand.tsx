// src/components/layout/Brand.tsx
import React from "react";
import { RicaLogo } from "../Brand";

export const Brand: React.FC = () => {
  return (
    <div className="min-w-0">
      <div className="rounded-xl bg-white px-3 py-2">
        <RicaLogo className="h-9 w-auto max-w-full" />
      </div>
      <p className="mt-2 text-[11px] font-medium tracking-wide text-teal-200/80">
        Attendance Management
      </p>
    </div>
  );
};