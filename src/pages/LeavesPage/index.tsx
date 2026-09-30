// src/pages/LeavesPage/index.tsx
import { type FormEvent, useMemo, useState } from "react";
import { Button, PageHeader } from "../../components/ui";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  mapDepartment,
  mapEmployee,
  mapLeave,
  mapUser,
  useCreateLeaveMutation,
  useGetDepartmentsQuery,
  useGetEmployeesQuery,
  useGetLeavesQuery,
  useMeQuery,
} from "../../services";
import type { Employee, LeaveType } from "../../types/types";

import { LeaveFormCard } from "./LeaveFormCard";
import { LeavesTable } from "./LeavesTable";

export function LeavesPage() {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Current user
  const { data: rawMe } = useMeQuery();
  const currentUser = useMemo(() => (rawMe ? mapUser(rawMe) : null), [rawMe]);
  const skip = !currentUser;

  const canEdit = Boolean(currentUser && can(currentUser.role, "leave"));

  // Employees
  const { data: rawEmployees = [] } = useGetEmployeesQuery(undefined, { skip });
  const people = useMemo<Employee[]>(
    () => rawEmployees.map(mapEmployee),
    [rawEmployees],
  );

  // Departments
  const { data: rawDepartments = [] } = useGetDepartmentsQuery(undefined, {
    skip,
  });
  const departments = useMemo(
    () => rawDepartments.map(mapDepartment),
    [rawDepartments],
  );

  // Leaves
  const {
    data: rawLeaves = [],
    isLoading: isLoadingLeaves,
    error: leavesError,
    refetch,
  } = useGetLeavesQuery(undefined, { skip });

  const [createLeave, { isLoading: isSubmitting }] = useCreateLeaveMutation();

  // Leaves this user is allowed to see
  const visibleLeaves = useMemo(() => {
    if (!currentUser) return [];

    const employeeByPerson = new Map(people.map((e) => [e.personId, e]));

    const allowedPersonIds = new Set(
      (currentUser.role === "admin" || currentUser.role === "director"
        ? people
        : people.filter((e) => e.departmentId === currentUser.departmentId)
      ).map((e) => e.personId),
    );

    return rawLeaves
      .map((l) => mapLeave(l, employeeByPerson))
      .filter((l) => allowedPersonIds.has(l.personId));
  }, [rawLeaves, people, currentUser]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    // Capture the form now: e.currentTarget is null after an await.
    const form = e.currentTarget;
    const fd = new FormData(form);
    const personId = String(fd.get("personId"));
    const emp = people.find((p) => p.personId === personId);

    if (!emp) {
      setErrorMsg("Selected employee was not found.");
      return;
    }

    const payload = {
      personId,
      employeeName: emp.name,
      departmentId: emp.departmentId,
      unitId: emp.unitId,
      type: String(fd.get("type")) as LeaveType,
      startDate: String(fd.get("startDate")),
      endDate: String(fd.get("endDate")),
      reason: String(fd.get("reason")),
      status: "Approved" as const,
    };

    try {
      await createLeave(payload).unwrap();
      setOpen(false);
      form.reset();
    } catch (cause) {
      setErrorMsg(errorMessage(cause, "Unable to save leave."));
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leave management"
        subtitle="Annual, Sick, Business Trip, Maternity, Paternity, and Unpaid. Approved leave sets attendance status to LV."
        actions={
          canEdit ? (
            <Button onClick={() => setOpen((v) => !v)}>
              {open ? "Close form" : "Add leave"}
            </Button>
          ) : undefined
        }
      />

      {errorMsg && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {errorMsg}
        </p>
      )}

      {open && canEdit && (
        <LeaveFormCard
          employees={people}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <LeavesTable
        leaves={visibleLeaves}
        departments={departments}
        isLoading={isLoadingLeaves}
        error={leavesError}
        errorMessage={
          leavesError
            ? errorMessage(leavesError, "Unable to load leaves.")
            : undefined
        }
        onRetry={refetch}
      />
    </div>
  );
}

export default LeavesPage;
