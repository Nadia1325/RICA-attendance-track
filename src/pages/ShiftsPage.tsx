import { FormEvent, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Button, Card, Input, PageHeader } from "../components/ui";
import type { Shift } from "../types";

export function ShiftsPage() {
  const { currentUser, shifts, addShift, updateShift, deleteShift } = useApp();
  const canManage = currentUser?.role === "admin" && can(currentUser.role, "manageUsers");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [error, setError] = useState("");

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const fd = new FormData(e.currentTarget);
    const startTime = String(fd.get("startTime")); const endTime = String(fd.get("endTime"));
    const data = { name: String(fd.get("name")), startTime, endTime, timetable: `${startTime}-${endTime}`, graceMinutes: Number(fd.get("graceMinutes")) };
    if (editing) updateShift(editing.id, data); else addShift(data);
    setOpen(false); setEditing(null);
  }
  function remove(s: Shift) { if (!window.confirm(`Delete ${s.name}?`)) return; try { deleteShift(s.id); } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete shift."); } }

  return <div><PageHeader title="Shifts & timetables" subtitle="Shift definitions drive expected check-in/out windows and late calculations." actions={canManage ? <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16}/>Add shift</Button> : undefined}/>
    {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {open && canManage && <Card className="mb-6 p-5"><form className="grid gap-3 sm:grid-cols-4" onSubmit={save}>
      <Input name="name" placeholder="Shift name" defaultValue={editing?.name ?? ""} required/><Input name="startTime" type="time" defaultValue={editing?.startTime ?? "08:00"} required/><Input name="endTime" type="time" defaultValue={editing?.endTime ?? "17:00"} required/><Input name="graceMinutes" type="number" min="0" defaultValue={editing?.graceMinutes ?? 10} required/>
      <div className="flex gap-2 sm:col-span-4"><Button type="submit">{editing ? "Save changes" : "Save shift"}</Button><Button type="button" variant="secondary" onClick={() => {setOpen(false);setEditing(null);}}>Cancel</Button></div>
    </form></Card>}
    <div className="grid gap-4 md:grid-cols-3">{shifts.map((s)=><Card key={s.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{s.name}</h2><p className="mt-2 text-2xl font-bold text-teal-800">{s.timetable}</p><p className="mt-2 text-sm text-slate-500">{s.graceMinutes} minute grace for lateness</p></div>{canManage&&<div className="flex gap-1"><button className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-800" title="Edit shift" aria-label="Edit shift" onClick={()=>{setEditing(s);setOpen(true)}}><Pencil size={17}/></button><button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Delete shift" aria-label="Delete shift" onClick={()=>remove(s)}><Trash2 size={17}/></button></div>}</div></Card>)}</div>
  </div>;
}
