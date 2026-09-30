// src/pages/ShiftsPage/index.tsx
import { type FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  useAddShiftMutation,
  useGetShiftsQuery,
  useUpdateShiftMutation,
} from "../../services/api";
import type { Shift } from "../../types/types";

import { ShiftCard } from "./ShiftCard";
import { ShiftFormCard } from "./ShiftFormCard";

export function ShiftsPage() {
  const { currentUser } = useApp();
  const canManage =
    currentUser?.role === "admin" && can(currentUser.role, "manageUsers");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [error, setError] = useState("");

  const shiftsQ = useGetShiftsQuery(undefined, { skip: !currentUser });
  const [addShift, { isLoading: isAdding }] = useAddShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();

  const shifts = (shiftsQ.data as Shift[] | undefined) ?? [];
  const isLoading = shiftsQ.isLoading;
  const fetchError = shiftsQ.isError
    ? errorMessage(shiftsQ.error, "Unable to load shifts.")
    : "";

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const startTime = String(fd.get("startTime"));
    const endTime = String(fd.get("endTime"));
    const data = {
      name: String(fd.get("name")),
      startTime,
      endTime,
      timetable: `${startTime}-${endTime}`,
      graceMinutes: 0,
    };

    try {
      if (editing) {
        await updateShift({ id: editing.id, ...data }).unwrap();
      } else {
        await addShift(data).unwrap();
      }
      setOpen(false);
      setEditing(null);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to save shift."));
    }
  }

  function handleEdit(shift: Shift) {
    setEditing(shift);
    setOpen(true);
  }

  function handleCancel() {
    setOpen(false);
    setEditing(null);
    setError("");
  }

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Shifts & timetables"
        subtitle="Shift definitions drive expected check-in/out windows and late calculations."
        actions={
          canManage ? (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Add shift
            </Button>
          ) : undefined
        }
      />

      {(error || fetchError) && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error || fetchError}
        </p>
      )}

      {open && canManage && (
        <ShiftFormCard
          editingShift={editing}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isSaving={isAdding || isUpdating}
        />
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500">
          Loading shift configuration...
        </div>
      ) : shifts.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          No shifts configured. Click &quot;Add shift&quot; to create one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              canManage={canManage}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShiftsPage;
