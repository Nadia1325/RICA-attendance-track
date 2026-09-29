// src/pages/UsersPage/PermissionsMatrix.tsx
import { Card } from "../../components/ui";

const PERMISSIONS_MATRIX = [
  ["Upload raw data", "Yes", "No", "No"],
  ["Verify / edit attendance", "Yes", "No", "No"],
  ["Add leave entries", "Yes", "Own dept", "No"],
  ["View all departments", "Yes", "No", "Yes"],
  ["View own department", "Yes", "Yes", "Yes"],
  ["Generate daily / monthly reports", "Yes", "Own dept", "All"],
  ["View performance KPIs", "Yes", "Own dept", "All"],
  ["Manage users & config", "Yes", "No", "No"],
];

export function PermissionsMatrix() {
  const headings = ["Feature", "Admin", "Head of Dept", "Director"];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">
        Permissions matrix
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-medium">
            <tr>
              {headings.map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PERMISSIONS_MATRIX.map((row) => (
              <tr key={row[0]} className="border-t border-slate-100">
                {row.map((cell, i) => (
                  <td key={`${row[0]}-${i}`} className="px-4 py-2 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}