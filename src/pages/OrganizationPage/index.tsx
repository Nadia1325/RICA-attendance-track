import { type FormEvent, useMemo, useState } from "react";
import { Button, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../../services/api";

import { DepartmentCard } from "./DepartmentCard";
import { DepartmentFormCard } from "./DepartmentFormCard";
import { EditDepartmentModal } from "./EditDepartmentModal";

interface EditingTarget {
  id: string;
  name: string;
  code: string;
}

export function OrganizationPage() {
  const { currentUser, employees, departments } = useApp();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();

  const admin = Boolean(currentUser && can(currentUser.role, "manageUsers"));

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<EditingTarget | null>(null);

  const headcounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const emp of employees) {
      if (emp.departmentId) {
        counts.set(emp.departmentId, (counts.get(emp.departmentId) ?? 0) + 1);
      }
    }
    return counts;
  }, [employees]);

  async function handleAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await addDepartment({
        name: String(fd.get("name")).trim(),
        code: String(fd.get("code")).trim().toUpperCase(),
      }).unwrap();
      form.reset();
      setOpen(false);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to add department."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateDepartment(
    id: string,
    name: string,
    code: string,
  ) {
    setError("");
    try {
      await updateDepartment({ id, name, code }).unwrap();
    } catch (cause) {
      setError(errorMessage(cause, "Unable to update department."));
    }
  }

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Organization"
        subtitle="Manage departments and office structure used for role-based access and reporting."
        actions={
          admin ? (
            <Button onClick={() => setOpen((v) => !v)}>
              {open ? "Close" : "Add department"}
            </Button>
          ) : undefined
        }
      />

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </p>
      )}

      {open && admin && (
        <DepartmentFormCard
          onSubmit={handleAddSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            headcount={headcounts.get(department.id) ?? 0}
            canEdit={admin}
            onEdit={() => setEditingDepartment(department)}
          />
        ))}
      </div>

      <EditDepartmentModal
        isOpen={Boolean(editingDepartment)}
        department={editingDepartment}
        onClose={() => setEditingDepartment(null)}
        onSave={handleUpdateDepartment}
      />
    </div>
  );
}

export default OrganizationPage;
