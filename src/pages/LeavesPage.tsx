import { FormEvent, useState } from "react";
import { departments, leaveTypes, units, useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Badge, Button, Card, Input, PageHeader, Select } from "../components/ui";
import type { LeaveType } from "../types";

export function LeavesPage() {
  const { currentUser, leaves, scopedEmployees, addLeave } = useApp();
  const canEdit = currentUser && can(currentUser.role, "leave");
  const people = scopedEmployees();
  const visible = leaves.filter((l) => people.some((p) => p.personId === l.personId));
  const [open, setOpen] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const personId = String(fd.get("personId"));
    const emp = people.find((p) => p.personId === personId);
    if (!emp) return;
    addLeave({
      personId,
      employeeName: emp.name,
      departmentId: emp.departmentId,
      unitId: emp.unitId,
      type: String(fd.get("type")) as LeaveType,
      startDate: String(fd.get("startDate")),
      endDate: String(fd.get("endDate")),
      reason: String(fd.get("reason")),
      status: "Approved",
    });
    setOpen(false);
    e.currentTarget.reset();
  }

  return (
    <div>
      <PageHeader
        title="Leave management"
        subtitle="Annual, Sick, Business Trip, Maternity, Paternity, and Unpaid. Approved leave sets attendance status to LV."
        actions={
          canEdit ? (
            <Button onClick={() => setOpen((v) => !v)}>{open ? "Close form" : "Add leave"}</Button>
          ) : undefined
        }
      />
      {open && canEdit && (
        <Card className="mb-6 p-5">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
            <Select name="personId" required>
              {people.map((p) => (
                <option key={p.id} value={p.personId}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select name="type">
              {leaveTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Input name="startDate" type="date" required aria-label="Leave start date" />
            <Input name="endDate" type="date" required aria-label="Leave end date" />
            <Input name="reason" placeholder="Reason" className="sm:col-span-2" required />
            <Button type="submit">Save leave & update status</Button>
          </form>
        </Card>
      )}
      <Card className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["Employee", "Type", "Dates", "Days", "Reason", "Status"].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium">{l.employeeName}</p>
                  <p className="text-xs text-slate-500">
                    {departments.find((d) => d.id === l.departmentId)?.name} ·{" "}
                    {units.find((u) => u.id === l.unitId)?.name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="sky">{l.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  {l.startDate} → {l.endDate}
                </td>
                <td className="px-4 py-3">{l.days}</td>
                <td className="px-4 py-3 text-slate-600">{l.reason}</td>
                <td className="px-4 py-3">
                  <Badge tone={l.status === "Approved" ? "emerald" : l.status === "Rejected" ? "rose" : "amber"}>
                    {l.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
