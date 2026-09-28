import { FormEvent, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { units, useApp } from "../data/store";
import { apiConfigured } from "../lib/api";
import { Badge, Button, Card, Input, PageHeader, Select } from "../components/ui";
import { can } from "../lib/permissions";
import type { Employee } from "../types";

export function EmployeesPage() {
  const { currentUser, scopedEmployees, shifts, addEmployee, updateEmployee, setEmployeeStatus, deleteEmployee, departments } = useApp();
  const canManage = !apiConfigured && currentUser?.role === "admin" && can(currentUser.role, "manageUsers");
  const people = scopedEmployees();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Employee["status"]>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [draft, setDraft] = useState<Omit<Employee, "id">>({ personId: "", name: "", departmentId: departments[0]?.id ?? "", unitId: "", position: "", gender: "Female", shiftId: shifts[0]?.id ?? "", status: "Active" });

  const filtered = useMemo(() => people.filter((e) => `${e.name} ${e.personId} ${e.position}`.toLowerCase().includes(q.toLowerCase().trim()) && (status === "all" || e.status === status)), [people, q, status]);
  const deptList = departments;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (editing) updateEmployee(editing.id, draft);
    else addEmployee(draft);
    setOpen(false); setEditing(null); setDraft({ personId: "", name: "", departmentId: departments[0]?.id ?? "", unitId: "", position: "", gender: "Female", shiftId: shifts[0]?.id ?? "", status: "Active" });
  }
  function startEdit(e: Employee) { setEditing(e); setDraft({ ...e }); setOpen(true); }
  function remove(e: Employee) { if (window.confirm(`Delete ${e.name} (${e.personId})? This removes the employee from the master list.`)) deleteEmployee(e.id); }

  return <div>
    <PageHeader title="Employee master" subtitle={apiConfigured ? "Employee records are loaded from the RICA backend." : "Search, maintain employee identity, status, department, unit and shift. Admin controls all employee records."} actions={canManage ? <Button onClick={() => { setEditing(null); setDraft({ personId: "", name: "", departmentId: departments[0]?.id ?? "", unitId: "", position: "", gender: "Female", shiftId: shifts[0]?.id ?? "", status: "Active" }); setOpen((v) => !v); }}>{open ? "Close form" : "Add employee"}</Button> : undefined} />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee name, ID or position…" /><Select className="sm:max-w-xs" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="all">All status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></Select></div>
    {open && canManage && <Card className="mb-6 p-5"><div className="mb-4"><h2 className="font-semibold">{editing ? "Edit employee" : "Add employee"}</h2><p className="text-xs text-slate-500">Employee information changes are recorded in the audit trail.</p></div><form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submit}>
      <Input value={draft.personId} onChange={(e) => setDraft({ ...draft, personId: e.target.value })} placeholder="Employee / Person ID" required />
      <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" required />
      <Input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} placeholder="Position" required />
      <Select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as Employee["gender"] })}><option>Female</option><option>Male</option></Select>
      <Select value={draft.departmentId} onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}>{deptList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
      <Select value={draft.unitId} onChange={(e) => setDraft({ ...draft, unitId: e.target.value })}>{units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>
      <Select value={draft.shiftId} onChange={(e) => setDraft({ ...draft, shiftId: e.target.value })}>{shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
      <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Employee["status"] })}><option>Active</option><option>Inactive</option></Select>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><Button type="submit">{editing ? "Save changes" : "Create employee"}</Button><Button type="button" variant="secondary" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button></div>
    </form></Card>}
    <Card className="overflow-auto"><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Person ID","Name","Position","Department","Unit","Shift","Status",...(canManage ? ["Actions"] : [])].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>
      {filtered.map((e) => <tr key={e.id} className="border-t border-slate-100"><td className="px-4 py-3 font-mono text-xs">{e.personId}</td><td className="px-4 py-3 font-medium">{e.name}</td><td className="px-4 py-3">{e.position}</td><td className="px-4 py-3">{deptList.find((d) => d.id === e.departmentId)?.name ?? "—"}</td><td className="px-4 py-3">{units.find((u) => u.id === e.unitId)?.name ?? "—"}</td><td className="px-4 py-3">{shifts.find((s) => s.id === e.shiftId)?.name ?? "—"}</td><td className="px-4 py-3"><button disabled={!canManage} onClick={() => setEmployeeStatus(e.id, e.status === "Active" ? "Inactive" : "Active")}><Badge tone={e.status === "Active" ? "emerald" : "slate"}>{e.status}</Badge></button></td>{canManage && <td className="px-4 py-3"><div className="flex gap-2"><button className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-800" title="Edit employee" aria-label="Edit employee" onClick={() => startEdit(e)}><Pencil size={17}/></button><button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Delete employee" aria-label="Delete employee" onClick={() => remove(e)}><Trash2 size={17}/></button></div></td>}</tr>)}
      {filtered.length === 0 && <tr><td colSpan={canManage ? 8 : 7} className="px-4 py-10 text-center text-sm text-slate-500">No employees match your search.</td></tr>}
    </tbody></table></Card>
    <p className="mt-3 text-xs text-slate-400">Showing {filtered.length} of {people.length} employees.</p>
  </div>;
}
