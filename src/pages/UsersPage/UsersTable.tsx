// src/pages/UsersPage/UsersTable.tsx
import { FormEvent } from "react";
import { Card } from "../../components/ui";
import type { Department, User } from "../../types/types";
import { UserRow } from "./UserRow";

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  departments: Department[];
  resetFor: string | null;
  onSetResetFor: (id: string | null) => void;
  onResetPassword: (e: FormEvent<HTMLFormElement>, id: string) => Promise<void>;
  onEditUser: (id: string, name: string, email: string) => Promise<void>;
  onDeactivateUser: (id: string, name: string) => Promise<void>;
}

export function UsersTable({
  users,
  currentUserId,
  departments,
  resetFor,
  onSetResetFor,
  onResetPassword,
  onEditUser,
  onDeactivateUser,
}: UsersTableProps) {
  const headings = [
    "User",
    "Email",
    "Role",
    "Scope",
    "Status",
    "Account actions",
  ];

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
            <tr>
              {headings.map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                currentUserId={currentUserId}
                departments={departments}
                isResetOpen={resetFor === u.id}
                onOpenReset={() => onSetResetFor(u.id)}
                onCancelReset={() => onSetResetFor(null)}
                onResetPassword={(e) => onResetPassword(e, u.id)}
                onEditUser={() => void onEditUser(u.id, u.name, u.email)}
                onDeactivateUser={() => void onDeactivateUser(u.id, u.name)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}