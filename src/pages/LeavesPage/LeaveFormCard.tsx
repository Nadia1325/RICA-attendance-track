// src/pages/LeavesPage/LeaveFormCard.tsx
import { type FormEvent } from "react";
import { Button, Card, Input, Select } from "../../components/ui";
import type { Employee, LeaveType } from "../../types";

export const LEAVE_TYPES: LeaveType[] = [
  "Annual Leave",
  "Sick Leave",
  "Business Trip",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
  "Other",
];

interface LeaveFormCardProps {
  employees: Employee[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function LeaveFormCard({
  employees,
  onSubmit,
  isSubmitting,
}: LeaveFormCardProps) {
  return (
    <Card className="mb-6 p-5">
      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={onSubmit}
      >
        <Select name="personId" required defaultValue="">
          <option value="" disabled>
            Select Employee
          </option>
          {employees.map((p) => (
            <option key={p.id} value={p.personId}>
              {p.name} ({p.personId})
            </option>
          ))}
        </Select>

        <Select name="type" defaultValue={LEAVE_TYPES[0]}>
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>

        <Input
          name="startDate"
          type="date"
          required
          aria-label="Leave start date"
        />

        <Input
          name="endDate"
          type="date"
          required
          aria-label="Leave end date"
        />

        <Input
          name="reason"
          placeholder="Reason"
          className="sm:col-span-2"
          required
        />

        <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save leave & update status"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
