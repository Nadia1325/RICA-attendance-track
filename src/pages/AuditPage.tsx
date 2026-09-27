import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { Badge, Card, PageHeader } from "../components/ui";

export function AuditPage() {
  const { currentUser, logs } = useApp();
  if (!currentUser || !can(currentUser.role, "manageUsers")) {
    return <Card className="p-8"><h1 className="text-lg font-semibold">Audit logs restricted</h1><p className="mt-2 text-sm text-slate-500">Only Admin can access organization-wide audit logs.</p></Card>;
  }
  return (
    <div>
      <PageHeader
        title="Audit logs"
        subtitle="Every login, upload, edit, and export is recorded with user, timestamp, and change delta."
      />
      <Card className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["Time", "User", "Action", "Entity", "Details", "Delta"].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium">{l.userName}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      l.action === "upload" ? "sky" : l.action === "edit" ? "amber" : l.action === "login" ? "teal" : "slate"
                    }
                  >
                    {l.action}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{l.entity}</td>
                <td className="px-4 py-3">{l.details}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{l.delta || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
