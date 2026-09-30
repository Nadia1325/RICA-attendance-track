// src/pages/VerificationPage/index.tsx
import { useMemo, useState } from "react";
import { PageHeader, Card } from "../../components/ui";
import {
  useGetAnomaliesQuery,
  useResolveAnomalyMutation,
} from "../../services/attendanceApi";
import { useGetDepartmentsQuery } from "../../services/referenceApi";
import { mapAnomaly, mapDepartment, mapEmployee } from "../../services/mappers";
import { useGetEmployeesQuery } from "../../services/referenceApi";

import { VerificationForm } from "../../features/verification/VerificationForm"
import {  VerificationQueue } from "../../features/verification/VerificationQueue"

export function VerificationPage() {
  const [selected, setSelected] = useState<string>("");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");

  const { data: rawAnomalies = [] } = useGetAnomaliesQuery();
  const { data: rawEmployees = [] } = useGetEmployeesQuery();
  const { data: rawDepartments = [] } = useGetDepartmentsQuery();
  const [resolveAnomaly] = useResolveAnomalyMutation();

  const employeeMap = useMemo(() => {
    const map = new Map();
    rawEmployees.forEach((e) => {
      const emp = mapEmployee(e);
      map.set(emp.personId, emp);
    });
    return map;
  }, [rawEmployees]);

  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );

  const anomalies = useMemo(
    () => rawAnomalies.map((a) => mapAnomaly(a, employeeMap)),
    [rawAnomalies, employeeMap],
  );

  const open = anomalies.filter((a) => !a.resolved);
  const filteredOpen = open.filter((a) => {
    const matchQ =
      !q ||
      `${a.name} ${a.personId} ${a.message}`
        .toLowerCase()
        .includes(q.toLowerCase());
    const matchDate = !date || a.date === date;
    return matchQ && matchDate;
  });

  const current = anomalies.find((a) => a.attendanceId === selected);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Verification queue"
        subtitle="Review flagged records, resolve anomalies, and promote to verified."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <VerificationQueue
          open={open}
          filteredOpen={filteredOpen}
          selected={selected}
          q={q}
          date={date}
          departments={departments}
          onSearchChange={setQ}
          onDateChange={setDate}
          onSelect={setSelected}
        />

        <VerificationForm
          record={current as any}
          isLoading={false}
          draft={{}}
          note=""
          error=""
          saving={false}
          setDraft={() => {}}
          setNote={() => {}}
          onSave={async (patch, message) => {
            if (!current) return;
            await resolveAnomaly({
              id: current.id,
              note: message ?? "",
            }).unwrap();
          }}
        />
      </div>
    </div>
  );
}

export default VerificationPage;
