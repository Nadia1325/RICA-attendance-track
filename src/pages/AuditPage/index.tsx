// src/pages/AuditPage/index.tsx
import { useMemo, useState } from "react";
import { Card, PageHeader } from "../../components/ui";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  mapAudit,
  mapUser,
  useGetAuditLogsQuery,
  useMeQuery,
} from "../../services";

import { AuditFilters } from "./AuditFilters";
import { AuditTable } from "./AuditTable";

export function AuditPage() {
  const [q, setQ] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");

  // Get current user details from API
  const { data: rawMe } = useMeQuery();
  const currentUser = useMemo(() => (rawMe ? mapUser(rawMe) : null), [rawMe]);

  // Permission check
  const isAuthorized = Boolean(
    currentUser && can(currentUser.role, "manageUsers")
  );

  // Fetch audit logs only if authorized
  const {
    data: rawLogs = [],
    isLoading,
    error,
    refetch,
  } = useGetAuditLogsQuery(undefined, {
    skip: !isAuthorized,
  });

  // Map raw log data to domain objects
  const logs = useMemo(() => rawLogs.map(mapAudit), [rawLogs]);

  // Filter logs by search query and action
  const filteredLogs = useMemo(() => {
    const query = q.toLowerCase().trim();
    return logs.filter((l) => {
      const matchesSearch =
        `${l.userName} ${l.entity} ${l.details} ${l.action}`
          .toLowerCase()
          .includes(query);

      const matchesAction =
        selectedAction === "ALL" ||
        l.action.toLowerCase() === selectedAction.toLowerCase();

      return matchesSearch && matchesAction;
    });
  }, [logs, q, selectedAction]);

  if (!isAuthorized) {
    return (
      <Card className="p-8">
        <h1 className="text-lg font-semibold text-slate-900">
          Audit logs restricted
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Only Admin can access organization-wide audit logs.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit logs"
        subtitle="Every login, upload, edit, and export is recorded with user, timestamp, and change delta."
      />

      <AuditFilters
        searchQuery={q}
        onSearchChange={setQ}
        selectedAction={selectedAction}
        onActionChange={setSelectedAction}
      />

      <AuditTable
        logs={filteredLogs}
        isLoading={isLoading}
        error={error}
        errorMessage={error ? errorMessage(error) : undefined}
        onRetry={refetch}
      />
    </div>
  );
}

export default AuditPage;