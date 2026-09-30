// src/pages/HolidaysPage/HolidayFormCard.tsx
import { type FormEvent } from "react";
import { Button, Card, DateField, Input, Select } from "../../components/ui";
import type { Holiday } from "../../types";

interface HolidayFormCardProps {
  date: string;
  onDateChange: (date: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function HolidayFormCard({
  date,
  onDateChange,
  onSubmit,
  onCancel,
  isSaving,
}: HolidayFormCardProps) {
  return (
    <Card className="mb-6 p-5">
      <form className="grid gap-3 sm:grid-cols-4" onSubmit={onSubmit}>
        <Input name="name" placeholder="Holiday name" required />
        <DateField label="Date" value={date} onChange={onDateChange} />
        <input type="hidden" name="date" value={date} />
        <Select name="type" defaultValue="Public">
          <option value="Public">Public</option>
          <option value="Organizational">Organizational</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
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
