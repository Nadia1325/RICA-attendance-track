import { type FormEvent, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, Card, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  mapUser,
  useCreateUserMutation,
  useGetUsersQuery,
  useLazyGetUserQuery,
  useResetUserPasswordMutation,
  useUpdateUserMutation,
} from "../../services/api";
import type { Role, User } from "../../types/types";

import { PermissionsMatrix } from "./PermissionsMatrix";
import { UserFormCard } from "./UserFormCard";
import { UsersTable } from "./UsersTable";
import { EditUserModal } from "./EditUserModal";

export function UsersPage() {
  const { currentUser, departments } = useApp();
  const allowed = Boolean(
    currentUser?.role && can(currentUser.role as Role, "manageUsers"),
  );

  const { data: rawUsers = [] } = useGetUsersQuery(undefined, {
    skip: !allowed,
  });
  const users = useMemo(
    () => rawUsers.map((u) => mapUser(u)).filter((u): u is User => u !== null),
    [rawUsers],
  );

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [resetUserPassword] = useResetUserPasswordMutation();
  const [loadUser] = useLazyGetUserQuery();

  const [open, setOpen] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAddUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    // Capture the form now: e.currentTarget is null after an await.
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = String(fd.get("password"));
    const role = String(fd.get("role")) as Role;
    const departmentId = String(fd.get("departmentId")) || undefined;

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (role === "hod" && !departmentId) {
      setError("Head of Department accounts must be assigned to a department.");
      return;
    }

    try {
      await createUser({
        name: String(fd.get("name")),
        username: String(fd.get("username")),
        email: String(fd.get("email")),
        password,
        role,
        departmentId,
      }).unwrap();
      setOpen(false);
      form.reset();
      setMessage("User account created successfully.");
    } catch (err) {
      setError(errorMessage(err, "Unable to create user."));
    }
  }

  async function handleResetPassword(
    e: FormEvent<HTMLFormElement>,
    id: string,
  ) {
    e.preventDefault();
    setError("");
    setMessage("");

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("newPassword"));

    if (password.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    try {
      await resetUserPassword({ id, newPassword: password }).unwrap();
      setResetFor(null);
      setMessage(
        "Temporary password set. The user will be required to change it at their next sign-in.",
      );
    } catch (err) {
      setError(errorMessage(err, "Unable to reset the password."));
    }
  }

  async function handleDeactivateUser(id: string, name: string) {
    if (!window.confirm(`Deactivate ${name}? This account will lose access.`)) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await updateUser({ id, active: false }).unwrap();
      setMessage(`${name}'s account was deactivated.`);
    } catch (err) {
      setError(errorMessage(err, "Unable to deactivate user."));
    }
  }

  async function handleEditUser(id: string, name: string, email: string) {
    let currentName = name;
    let currentEmail = email;

    try {
      const details = await loadUser(id).unwrap();
      currentName = String(details.full_name ?? currentName);
      currentEmail = String(details.email ?? currentEmail);
    } catch (cause) {
      setError(errorMessage(cause, "Unable to load user details."));
      return;
    }

    setEditingUser({ id, name: currentName, email: currentEmail });
  }

  async function handleSaveUser(id: string, name: string, email: string) {
    setError("");
    setMessage("");
    try {
      await updateUser({ id, name, email }).unwrap();
      setMessage("User details updated.");
    } catch (err) {
      setError(errorMessage(err, "Unable to update user details."));
      throw err;
    }
  }

  if (!allowed) {
    return (
      <Card className="p-8">
        <h1 className="text-lg font-semibold">User management restricted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Only Admin can manage users and system configuration.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Users & configuration"
        subtitle="Admin-only account management: create users, assign roles and departments, reset passwords, and deactivate accounts."
        actions={
          <Button onClick={() => setOpen((v) => !v)}>
            <UserPlus size={16} />
            Add user
          </Button>
        }
      />

      {message && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {open && (
        <UserFormCard departments={departments} onSubmit={handleAddUser} />
      )}

      <UsersTable
        users={users}
        currentUserId={currentUser?.id}
        departments={departments}
        resetFor={resetFor}
        onSetResetFor={setResetFor}
        onResetPassword={handleResetPassword}
        onEditUser={handleEditUser}
        onDeactivateUser={handleDeactivateUser}
      />

      <PermissionsMatrix />
      <EditUserModal
        key={editingUser?.id ?? "closed"}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
    </div>
  );
}

export default UsersPage;
