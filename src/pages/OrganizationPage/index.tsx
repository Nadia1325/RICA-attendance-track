import { type FormEvent, useMemo, useState } from "react";
import { Button, ConfirmDialog, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../../services/api";

import { DepartmentCard } from "./DepartmentCard";
import { DepartmentFormCard } from "./DepartmentFormCard";
import { EditDepartmentModal } from "./EditDepartmentModal";
import type { Role } from "../../types/types";

interface EditingTarget {
  id: string;
  name: string;
  code: string;
}

export function OrganizationPage() {
  const { currentUser, employees, departments } = useApp();
  const [addDepartment] = useAddDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const admin = Boolean(
    currentUser?.role && can(currentUser.role as Role, "manageUsers"),
  );

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<EditingTarget | null>(null);
  const [deletingDepartment, setDeletingDepartment] =
    useState<EditingTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        office: String(fd.get("code")).trim().toUpperCase(),
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
      await updateDepartment({ id, name, office: code }).unwrap();
    } catch (cause) {
      setError(errorMessage(cause, "Unable to update department."));
    }
  }

  async function handleDeleteDepartment() {
    if (!deletingDepartment) return;
    setError("");
    setIsDeleting(true);
    try {
      await deleteDepartment(deletingDepartment.id).unwrap();
      setDeletingDepartment(null);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to delete department."));
    } finally {
      setIsDeleting(false);
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
            onDelete={() => setDeletingDepartment(department)}
          />
        ))}
      </div>

      <EditDepartmentModal
        isOpen={Boolean(editingDepartment)}
        department={editingDepartment}
        onClose={() => setEditingDepartment(null)}
        onSave={handleUpdateDepartment}
      />
      <ConfirmDialog
        open={Boolean(deletingDepartment)}
        title="Delete department?"
        description={
          deletingDepartment
            ? `Delete ${deletingDepartment.name}? Only empty departments can be removed.`
            : ""
        }
        confirmLabel="Delete department"
        busy={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDeletingDepartment(null);
        }}
        onConfirm={() => void handleDeleteDepartment()}
      />
    </div>
  );
}

export default OrganizationPage;
