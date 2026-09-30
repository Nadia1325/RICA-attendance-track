// src/pages/HolidaysPage/index.tsx
import { type FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button, PageHeader } from "../../components/ui";
import { can } from "../../lib/permissions";
import {
  errorMessage,
  mapHoliday,
  mapUser,
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useGetHolidaysQuery,
  useMeQuery,
} from "../../services";
import type { Holiday } from "../../types";

import { HolidayFormCard } from "./HolidayFormCard";
import { HolidaysTable } from "./HolidaysTable";

export function HolidaysPage() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Current User Query
  const { data: rawMe } = useMeQuery();
  const currentUser = useMemo(() => (rawMe ? mapUser(rawMe) : null), [rawMe]);

  const canManage = Boolean(
    currentUser?.role === "admin" && can(currentUser.role, "manageUsers")
  );

  // Holidays Queries & Mutations
  const {
    data: rawHolidays = [],
    isLoading,
    error: fetchError,
    refetch,
  } = useGetHolidaysQuery();

  const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  const holidays = useMemo(() => {
    return rawHolidays
      .map(mapHoliday)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawHolidays]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const newHoliday = {
      name: String(fd.get("name")),
      date,
      type: String(fd.get("type")) as Holiday["type"],
    };

    try {
      await createHoliday(newHoliday).unwrap();
      setOpen(false);
      setDate("");
    } catch (cause) {
      setErrorMsg(errorMessage(cause) || "Unable to save the holiday.");
    }
  };

  const handleRemove = async (h: Holiday) => {
    if (!window.confirm(`Delete ${h.name}?`)) return;
    setErrorMsg("");

    try {
      await deleteHoliday(h.id).unwrap();
    } catch (cause) {
      setErrorMsg(errorMessage(cause) || "Unable to delete the holiday.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Holidays"
        subtitle="Public and organizational holidays are excluded from working-day KPI denominators."
        actions={
          canManage ? (
            <Button
              onClick={() => {
                setDate("");
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Add holiday
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

      {open && canManage && (
        <HolidayFormCard
          date={date}
          onDateChange={setDate}
          onSubmit={handleSave}
          onCancel={() => setOpen(false)}
          isSaving={isCreating}
        />
      )}

      <HolidaysTable
        holidays={holidays}
        canManage={canManage}
        isLoading={isLoading}
        error={fetchError}
        errorMessage={fetchError ? errorMessage(fetchError) : undefined}
        onRetry={refetch}
        onDelete={handleRemove}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default HolidaysPage;