import { FormEvent, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Badge, Button, Card, Input, PageHeader, Select, DateField } from "../components/ui";
import type { Holiday } from "../types";
import { apiConfigured } from "../lib/api";

export function HolidaysPage() {
  const { currentUser, holidays, addHoliday, updateHoliday, deleteHoliday } = useApp();
  const canManage = currentUser?.role === "admin" && can(currentUser.role, "manageUsers");
  const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Holiday|null>(null); const [date,setDate]=useState(""); const [error,setError]=useState("");
  async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");const fd=new FormData(e.currentTarget);const data={name:String(fd.get("name")),date,type:String(fd.get("type")) as Holiday["type"]};try{if(editing)await updateHoliday(editing.id,data);else await addHoliday(data);setOpen(false);setEditing(null);}catch(cause){setError(cause instanceof Error?cause.message:"Unable to save the holiday.");}}
  function edit(h:Holiday){setEditing(h);setDate(h.date);setOpen(true)}
  async function remove(h:Holiday){if(!window.confirm(`Delete ${h.name}?`))return;setError("");try{await deleteHoliday(h.id);}catch(cause){setError(cause instanceof Error?cause.message:"Unable to delete the holiday.");}}
  return <div><PageHeader title="Holidays" subtitle="Public and organizational holidays are excluded from working-day KPI denominators." actions={canManage?<Button onClick={()=>{setEditing(null);setDate("");setOpen(true)}}><Plus size={16}/>Add holiday</Button>:undefined}/>
  {error&&<p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
  {open&&canManage&&<Card className="mb-6 p-5"><form className="grid gap-3 sm:grid-cols-4" onSubmit={save}><Input name="name" placeholder="Holiday name" defaultValue={editing?.name??""} required/><DateField label="Date" value={date} onChange={setDate}/><input type="hidden" name="date" value={date}/><Select name="type" defaultValue={editing?.type??"Public"}><option>Public</option><option>Organizational</option></Select><div className="flex gap-2"><Button type="submit">{editing?"Save changes":"Save"}</Button><Button type="button" variant="secondary" onClick={()=>{setOpen(false);setEditing(null)}}>Cancel</Button></div></form></Card>}
  <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[650px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Type</th>{canManage&&<th className="px-4 py-2">Actions</th>}</tr></thead><tbody>{[...holidays].sort((a,b)=>a.date.localeCompare(b.date)).map(h=><tr key={h.id} className="border-t border-slate-100"><td className="px-4 py-3">{h.date}</td><td className="px-4 py-3 font-medium">{h.name}</td><td className="px-4 py-3"><Badge tone={h.type==='Public'?'teal':'sky'}>{h.type}</Badge></td>{canManage&&<td className="px-4 py-3"><div className="flex gap-1">{!apiConfigured&&<button className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-800" title="Edit holiday" aria-label="Edit holiday" onClick={()=>edit(h)}><Pencil size={17}/></button>}<button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Delete holiday" aria-label="Delete holiday" onClick={()=>void remove(h)}><Trash2 size={17}/></button></div></td>}</tr>)}</tbody></table></div></Card></div>;
}
