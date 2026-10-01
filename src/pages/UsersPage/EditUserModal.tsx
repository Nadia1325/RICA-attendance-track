import { type FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Button, Input } from "../../components/ui";

interface EditUserModalProps {
  user: { id: string; name: string; email: string } | null;
  onClose: () => void;
  onSave: (id: string, name: string, email: string) => Promise<void>;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await onSave(user.id, name.trim(), email.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit user</h2>
            <p className="mt-1 text-sm text-slate-500">Update the user’s name and email address.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close edit user form"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
            <Input className="mt-1.5 w-full" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email address
            <Input className="mt-1.5 w-full" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
