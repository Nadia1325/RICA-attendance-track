// src/pages/OrganizationPage/DepartmentFormCard.tsx
import { FormEvent } from "react";
import { Button, Card, Input } from "../../components/ui";

interface DepartmentFormCardProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
}

export function DepartmentFormCard({
  onSubmit,
  isSubmitting = false,
}: DepartmentFormCardProps) {
  return (
    <Card className="mb-5 min-w-0 p-4 sm:p-5">
      <form
        className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        onSubmit={onSubmit}
      >
        <Input
          name="name"
          placeholder="Department / organization name"
          required
          autoFocus
        />
        <Input
          name="code"
          placeholder="Short code (e.g. ICT)"
          maxLength={8}
          required
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add department"}
        </Button>
      </form>
    </Card>
  );
}