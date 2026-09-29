// src/pages/LoginPage/PasswordRecoveryForm.tsx
import { FormEvent } from "react";
import { Button, Input } from "../../components/ui";

interface PasswordRecoveryFormProps {
  recoverySent: boolean;
  recoveryEmail: string;
  onRecoveryEmailChange: (value: string) => void;
  recoveryToken: string;
  onRecoveryTokenChange: (value: string) => void;
  recoveryPassword: string;
  onRecoveryPasswordChange: (value: string) => void;
  recoveryConfirm: string;
  onRecoveryConfirmChange: (value: string) => void;
  onRequestReset: (e: FormEvent) => void;
  onResetPassword: (e: FormEvent) => void;
  isBusy: boolean;
}

export function PasswordRecoveryForm({
  recoverySent,
  recoveryEmail,
  onRecoveryEmailChange,
  recoveryToken,
  onRecoveryTokenChange,
  recoveryPassword,
  onRecoveryPasswordChange,
  recoveryConfirm,
  onRecoveryConfirmChange,
  onRequestReset,
  onResetPassword,
  isBusy,
}: PasswordRecoveryFormProps) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 p-4">
      {!recoverySent ? (
        <form className="space-y-3" onSubmit={onRequestReset}>
          <p className="text-sm font-semibold">Request password reset</p>
          <Input
            type="email"
            placeholder="Account email"
            autoComplete="email"
            required
            value={recoveryEmail}
            onChange={(e) => onRecoveryEmailChange(e.target.value)}
          />
          <Button disabled={isBusy}>
            {isBusy ? "Requesting…" : "Send reset instructions"}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={onResetPassword}>
          <p className="text-sm font-semibold">Choose a new password</p>
          <Input
            placeholder="Reset token from your email"
            required
            value={recoveryToken}
            onChange={(e) => onRecoveryTokenChange(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New password (at least 8 characters)"
            minLength={8}
            autoComplete="new-password"
            required
            value={recoveryPassword}
            onChange={(e) => onRecoveryPasswordChange(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            minLength={8}
            autoComplete="new-password"
            required
            value={recoveryConfirm}
            onChange={(e) => onRecoveryConfirmChange(e.target.value)}
          />
          <Button disabled={isBusy}>
            {isBusy ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      )}
    </div>
  );
}