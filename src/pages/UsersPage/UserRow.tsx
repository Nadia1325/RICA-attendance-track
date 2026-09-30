// src/pages/UsersPage/UserRow.tsx
import { type FormEvent } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { Badge, Button, Input } from "../../components/ui";
import { roleLabel } from "../../lib/utils";
import type { Department, User } from "../../types/types";

interface UserRowProps {
  user: User;
  currentUserId?: string;
  departments: Department[];
  isResetOpen: boolean;
  onOpenReset: () => void;
  onCancelReset: () => void;
  onResetPassword: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onEditUser: () => void;
  onDeactivateUser: () => void;
}

export function UserRow({
  user,
  currentUserId,
  departments,
  isResetOpen,
  onOpenReset,
  onCancelReset,
  onResetPassword,
  onEditUser,
  onDeactivateUser,
}: UserRowProps) {
  const departmentName =
    departments.find((d) => d.id === user.departmentId)?.name ??
    "Institution-wide";

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
      <td className="px-4 py-3 text-slate-600">{user.email}</td>
      <td className="px-4 py-3">
        <Badge tone="teal">{roleLabel(user.role)}</Badge>
      </td>
      <td className="px-4 py-3 text-slate-500">{departmentName}</td>
      <td className="px-4 py-3">
        <Badge tone={user.active ? "emerald" : "rose"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onEditUser}>
            Edit details
          </Button>
          <Button variant="secondary" onClick={onOpenReset}>
            <KeyRound size={15} />
            Reset password
          </Button>
          <Button
            variant="danger"
            onClick={onDeactivateUser}
            disabled={user.id === currentUserId || !user.active}
          >
            <Trash2 size={15} />
            Deactivate
          </Button>
        </div>

        {isResetOpen && (
          <form
            onSubmit={onResetPassword}
            className="mt-3 flex max-w-md items-center gap-2"
          >
            <Input
              name="newPassword"
              type="password"
              minLength={8}
              placeholder="New password (8+ chars)"
              required
            />
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={onCancelReset}>
              Cancel
            </Button>
          </form>
        )}
      </td>
    </tr>
  );
}