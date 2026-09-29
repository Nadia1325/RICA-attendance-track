// src/pages/ShiftsPage/ShiftFormCard.tsx
import { FormEvent } from "react";
import { Button, Card, Input } from "../../components/ui";
import type { Shift } from "../../types/types";

interface ShiftFormCardProps {
  editingShift: Shift | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function ShiftFormCard({
  editingShift,
  onSubmit,
  onCancel,
  isSaving,
}: ShiftFormCardProps) {
  return (
    <Card className="mb-6 p-5">
      <form className="grid gap-3 sm:grid-cols-3" onSubmit={onSubmit}>
        <Input
          name="name"
          placeholder="Shift name"
          defaultValue={editingShift?.name ?? ""}
          required
        />
        <Input
          name="startTime"
          type="time"
          defaultValue={editingShift?.startTime ?? "08:00"}
          required
        />
        <Input
          name="endTime"
          type="time"
          defaultValue={editingShift?.endTime ?? "17:00"}
          required
        />
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : editingShift
              ? "Save changes"
              : "Save shift"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}