import { FormEvent, useState } from "react";
import { units, useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Button, Card, Input, PageHeader } from "../components/ui";

export function OrganizationPage() {
  const { currentUser, employees, departments, addDepartment } = useApp();
  const admin = currentUser && can(currentUser.role, "manageUsers");
  const [open, setOpen] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = new FormData(e.currentTarget); addDepartment({ name: String(fd.get("name")), code: String(fd.get("code")).toUpperCase() }); e.currentTarget.reset(); setOpen(false); }
  return <div>
    <PageHeader title="Organization" subtitle="Manage departments and office/unit structure used for role-based access and reporting." actions={admin ? <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Add department"}</Button> : undefined} />
    {open && admin && <Card className="mb-6 p-5"><form className="grid gap-3 sm:grid-cols-3" onSubmit={submit}><Input name="name" placeholder="Department / organization name" required /><Input name="code" placeholder="Short code (e.g. ICT)" maxLength={8} required /><Button type="submit">Add department</Button></form></Card>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{departments.map((d) => { const deptUnits = units.filter((u) => u.departmentId === d.id); const headcount = employees.filter((e) => e.departmentId === d.id).length; return <Card key={d.id} className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{d.code}</p><h2 className="mt-1 text-lg font-bold">{d.name}</h2><p className="text-sm text-slate-500">{headcount} employees · {deptUnits.length} units</p><ul className="mt-4 space-y-2">{deptUnits.map((u) => <li key={u.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><p className="font-medium">{u.name}</p><p className="text-xs text-slate-500">{employees.filter((e) => e.unitId === u.id).length} staff</p></li>)}{deptUnits.length === 0 && <li className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">No units configured yet.</li>}</ul></Card>; })}</div>
  </div>;
}
