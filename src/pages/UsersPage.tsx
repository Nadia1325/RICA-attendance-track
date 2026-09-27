import { FormEvent, useState } from "react";
import { departments, units, useApp } from "../data/store";
import { can } from "../lib/permissions";
import { roleLabel } from "../lib/utils";
import { Badge, Button, Card, Input, PageHeader, Select } from "../components/ui";
import type { Role } from "../types";
import { KeyRound, Trash2, UserPlus } from "lucide-react";

const matrix = [
  ["Upload raw data", "Yes", "No", "No", "No"],
  ["Verify / edit attendance", "Yes", "No", "Own unit", "No"],
  ["Add leave entries", "Yes", "No", "Own unit", "No"],
  ["View all departments", "Yes", "No", "No", "Yes"],
  ["View own department", "Yes", "Yes", "Yes", "Yes"],
  ["Generate daily / monthly reports", "Yes", "Own dept", "Own unit", "All"],
  ["View performance KPIs", "Yes", "Own dept", "Own unit", "All"],
  ["Manage users & config", "Yes", "No", "No", "No"],
];

export function UsersPage() {
  const { currentUser, users, addUser, resetUserPassword, deleteUser } = useApp();
  const allowed = currentUser && can(currentUser.role, "manageUsers");
  const [open, setOpen] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setMessage("");
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const role = String(fd.get("role")) as Role;
    const departmentId = String(fd.get("departmentId")) || undefined;
    const unitId = String(fd.get("unitId")) || undefined;
    if (password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (role === "hod" && !departmentId) { setError("Head of Department accounts must be assigned to a department."); return; }
    if (role === "hou" && (!departmentId || !unitId)) { setError("Head of Office/Unit accounts must be assigned to both a department and an office/unit."); return; }
    try {
      await addUser({
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        password,
        role,
        departmentId,
        unitId,
      });
      setOpen(false); e.currentTarget.reset(); setMessage("User account created successfully.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create user."); }
  }

  async function onReset(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("newPassword"));
    if (password.length < 8) { setError("New password must contain at least 8 characters."); return; }
    await resetUserPassword(id, password);
    setResetFor(null); setMessage("Password reset successfully. The new password is active immediately.");
  }

  function remove(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This account will immediately lose access and will no longer be able to log in.`)) return;
    try { deleteUser(id); setMessage(`${name} was deleted and can no longer log in.`); } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete user."); }
  }

  if (!allowed) return <Card className="p-8"><h1 className="text-lg font-semibold">User management restricted</h1><p className="mt-2 text-sm text-slate-500">Only Admin can manage users and system configuration.</p></Card>;

  return (
    <div>
      <PageHeader title="Users & configuration" subtitle="Admin-only account lifecycle management with role, department, unit, password reset, and immediate account removal." actions={<Button onClick={() => setOpen((v) => !v)}><UserPlus size={16} />Add user</Button>} />
      {message && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {open && <Card className="mb-6 p-5">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" onSubmit={onSubmit}>
          <Input name="name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Gmail / work email" required />
          <Input name="password" type="password" placeholder="Initial password" minLength={8} required />
          <Select name="role"><option value="admin">Admin</option><option value="hod">Head of Department</option><option value="hou">Head of Office/Unit</option><option value="director">Director</option></Select>
          <Select name="departmentId"><option value="">Department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
          <Select name="unitId"><option value="">Office / Unit</option>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>
          <Button type="submit" className="sm:col-span-2 lg:col-span-1">Create account</Button>
        </form>
      </Card>}

      <Card className="mb-6 overflow-hidden">
        <div className="overflow-x-auto"><table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["User", "Email", "Role", "Scope", "Status", "Account actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium">{u.name}</td>
            <td className="px-4 py-3">{u.email}</td>
            <td className="px-4 py-3"><Badge tone="teal">{roleLabel(u.role)}</Badge></td>
            <td className="px-4 py-3 text-slate-500">{departments.find((d) => d.id === u.departmentId)?.name ?? "Institution-wide"}{u.unitId ? ` · ${units.find((x) => x.id === u.unitId)?.name ?? ""}` : ""}</td>
            <td className="px-4 py-3"><Badge tone={u.active ? "emerald" : "rose"}>{u.active ? "Active" : "Deleted"}</Badge></td>
            <td className="px-4 py-3"><div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setResetFor(u.id); setError(""); }}><KeyRound size={15} />Reset password</Button>
              <Button variant="danger" onClick={() => remove(u.id, u.name)} disabled={u.id === currentUser?.id}><Trash2 size={15} />Delete</Button>
            </div>{resetFor === u.id && <form onSubmit={(e) => void onReset(e, u.id)} className="mt-3 flex max-w-md gap-2"><Input name="newPassword" type="password" minLength={8} placeholder="New password (8+ chars)" required /><Button type="submit">Save</Button><Button type="button" variant="ghost" onClick={() => setResetFor(null)}>Cancel</Button></form>}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 font-semibold">Permissions matrix</div>
        <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Feature", "Admin", "Head of Dept", "Head of Unit", "Director"].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr></thead><tbody>{matrix.map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((c, i) => <td key={`${row[0]}-${i}`} className="px-4 py-2">{c}</td>)}</tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}
