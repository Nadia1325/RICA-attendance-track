import type { Dispatch, SetStateAction } from "react";
import { Button, Card, Input, Select } from "../../components/ui";
import type { AttendanceFinal } from "../../types/types";
import { Field } from "./Field";
import { STATUS_OPTIONS } from "../../types/verification.types";

interface VerificationFormProps {
  record: AttendanceFinal | undefined;
  isLoading: boolean;
  draft: Partial<AttendanceFinal>;
  note: string;
  error: string;
  saving: boolean;
  setDraft: Dispatch<SetStateAction<Partial<AttendanceFinal>>>;
  setNote: (note: string) => void;
  onSave: (patch: Partial<AttendanceFinal>, message?: string) => Promise<void>;
}

export function VerificationForm({
  record,
  isLoading,
  draft,
  note,
  error,
  saving,
  setDraft,
  setNote,
  onSave,
}: VerificationFormProps) {
  return (
    <Card className="p-5 lg:col-span-3">
      {!record && (
        <p className="text-sm text-slate-500">
          Select a flagged record to correct punches, minutes, or notes.
        </p>
      )}

      {record && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{record.name}</h2>
            <p className="text-sm text-slate-500">
              {record.personId} · {record.date} · {record.timetable}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-400">Loading details...</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Check-in">
                  <Input
                    value={draft.checkIn ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, checkIn: e.target.value }))}
                  />
                </Field>
                <Field label="Check-out">
                  <Input
                    value={draft.checkOut ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, checkOut: e.target.value }))}
                  />
                </Field>
                <Field label="Work minutes">
                  <Input
                    type="number"
                    value={draft.work ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, work: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Attended minutes">
                  <Input
                    type="number"
                    value={draft.attended ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, attended: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Late minutes">
                  <Input
                    type="number"
                    value={draft.late ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, late: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Early leave minutes">
                  <Input
                    type="number"
                    value={draft.early ?? 0}
                    onChange={(e) => setDraft((d) => ({ ...d, early: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={draft.status ?? record.status}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, status: e.target.value as AttendanceFinal["status"] }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Explanatory note">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why this correction was made"
                />
              </Field>

              {error && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <Button disabled={saving} onClick={() => void onSave(draft)}>
                  {saving ? "Saving…" : "Save to verified records"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={() =>
                    void onSave(
                      { status: "LV", leave: 480, attended: 0, work: 0 },
                      note || "Marked as leave"
                    )
                  }
                >
                  Convert to leave (LV)
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}