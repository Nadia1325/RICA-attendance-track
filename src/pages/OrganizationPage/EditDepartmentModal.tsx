// src/pages/OrganizationPage/EditDepartmentModal.tsx
import { type FormEvent, useState } from "react";
import { Button, Input } from "../../components/ui";

interface EditDepartmentModalProps {
  isOpen: boolean;
  department: { id: string; name: string; code: string } | null;
  onClose: () => void;
  onSave: (id: string, name: string, code: string) => Promise<void>;
}

export function EditDepartmentModal({
  isOpen,
  department,
  onClose,
  onSave,
}: EditDepartmentModalProps) {
  if (!isOpen || !department) return null;

  const [name, setName] = useState(department.name);
  const [code, setCode] = useState(department.code);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(department!.id, name.trim(), code.trim().toUpperCase());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">Edit Department</h3>
        <p className="mt-1 text-xs text-slate-500">
          Update the display name and short office code.
        </p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Department Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Short Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}