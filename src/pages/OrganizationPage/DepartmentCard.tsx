// src/pages/OrganizationPage/DepartmentCard.tsx
import { Trash2 } from "lucide-react";
import { Button, Card } from "../../components/ui";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface DepartmentCardProps {
  department: Department;
  headcount: number;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function DepartmentCard({
  department,
  headcount,
  canEdit,
  onEdit,
  onDelete,
}: DepartmentCardProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase tracking-wide text-teal-700">
            {department.code}
          </p>
          <h2 className="mt-1 break-words text-lg font-bold text-slate-900">
            {department.name}
          </h2>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={onEdit}>Edit</Button>
            <Button
              variant="danger"
              className="px-2"
              onClick={onDelete}
              disabled={headcount > 0}
              title={headcount > 0 ? "Move employees before deleting" : "Delete department"}
              aria-label={`Delete ${department.name}`}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {headcount} {headcount === 1 ? "employee" : "employees"}
      </p>
    </Card>
  );
}