import { FormEvent, useState } from "react";
import { units, useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Button, Card, Input, PageHeader } from "../components/ui";

export function OrganizationPage() {
  const { currentUser, employees, departments, addDepartment, updateDepartment } = useApp();
  const admin = currentUser && can(currentUser.role, "manageUsers");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); const form = e.currentTarget; const fd = new FormData(form);
    try { await addDepartment({ name: String(fd.get("name")), code: String(fd.get("code")).toUpperCase() }); form.reset(); setOpen(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to add department."); }
  }
  async function editDepartment(id: string, name: string, code: string) {
    const nextName = window.prompt("Department name", name);
    if (nextName === null) return;
    const nextCode = window.prompt("Office / short code", code);
    if (nextCode === null) return;
    setError("");
    try { await updateDepartment(id, { name: nextName.trim(), code: nextCode.trim().toUpperCase() }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update department."); }
  }
  return <div className="min-w-0">
    <PageHeader title="Organization" subtitle="Manage departments and office structure used for role-based access and reporting." actions={admin ? <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Add department"}</Button> : undefined} />
    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {open && admin && <Card className="mb-5 min-w-0 p-4 sm:p-5"><form className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3" onSubmit={submit}><Input name="name" placeholder="Department / organization name" required /><Input name="code" placeholder="Short code (e.g. ICT)" maxLength={8} required /><Button type="submit">Add department</Button></form></Card>}
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {departments.map((department) => {
        const deptUnits = units.filter((unit) => unit.departmentId === department.id);
        const headcount = employees.filter((employee) => employee.departmentId === department.id).length;
        return <Card key={department.id} className="min-w-0 p-4 sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2"><div className="min-w-0"><p className="break-words text-xs font-semibold uppercase tracking-wide text-teal-700">{department.code}</p><h2 className="mt-1 break-words text-lg font-bold">{department.name}</h2></div>{admin && <Button variant="secondary" className="shrink-0" onClick={() => void editDepartment(department.id, department.name, department.code)}>Edit</Button>}</div>
          <p className="mt-1 text-sm text-slate-500">{headcount} employees · {deptUnits.length} units</p>
          <ul className="mt-4 space-y-2">{deptUnits.map((unit) => <li key={unit.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><p className="font-medium">{unit.name}</p><p className="text-xs text-slate-500">{employees.filter((employee) => employee.unitId === unit.id).length} staff</p></li>)}{deptUnits.length === 0 && <li className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">No units configured yet.</li>}</ul>
        </Card>;
      })}
    </div>
  </div>;
}
