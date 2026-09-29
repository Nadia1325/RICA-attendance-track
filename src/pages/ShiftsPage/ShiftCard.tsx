// src/pages/ShiftsPage/ShiftCard.tsx
import { Pencil } from "lucide-react";
import { Card } from "../../components/ui";
import type { Shift } from "../../types/types";

interface ShiftCardProps {
  shift: Shift;
  canManage: boolean;
  onEdit: (shift: Shift) => void;
}

export function ShiftCard({ shift, canManage, onEdit }: ShiftCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{shift.name}</h2>
          <p className="mt-2 text-2xl font-bold text-teal-800">
            {shift.timetable || `${shift.startTime}-${shift.endTime}`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Working shift</p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-800 transition-colors"
              title="Edit shift"
              aria-label="Edit shift"
              onClick={() => onEdit(shift)}
            >
              <Pencil size={17} />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}