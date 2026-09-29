// src/pages/PasswordPage/PasswordChangeForm.tsx
import { FormEvent, useState } from "react";
import { Button, Input } from "../../components/ui";
import { StatusAlert } from "./StatusAlert";

interface PasswordChangeFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  busy: boolean;
  error: string;
  message: string;
  setError: (err: string) => void;
  setMessage: (msg: string) => void;
}

export function PasswordChangeForm({
  onSubmit,
  busy,
  error,
  message,
  setError,
  setMessage,
}: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirm) {
      setError("The new password and confirmation do not match.");
      return;
    }

    try {
      await onSubmit(currentPassword, password);
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
    } catch {
      // Error handling is managed by the caller
    }
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
      <label className="block text-sm font-medium text-slate-700">
        Current password
        <Input
          className="mt-1"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        New password
        <Input
          className="mt-1"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Use at least 8 characters.
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Confirm new password
        <Input
          className="mt-1"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>

      <StatusAlert error={error} message={message} />

      <Button disabled={busy} type="submit">
        {busy ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}