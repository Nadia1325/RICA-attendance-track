import { type FormEvent } from "react";
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
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner animate-in fade-in">
      {!recoverySent ? (
        <form className="space-y-3" onSubmit={onRequestReset}>
          <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Request password reset
          </p>
          <Input
            type="email"
            placeholder="Account email"
            autoComplete="email"
            required
            value={recoveryEmail}
            onChange={(e) => onRecoveryEmailChange(e.target.value)}
            className="w-full rounded-lg border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs focus:border-rica-500 focus:ring-rica-500/20"
          />
          <Button
            disabled={isBusy}
            className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 transition-all"
          >
            {isBusy ? "Requesting…" : "Send reset instructions"}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={onResetPassword}>
          <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Choose a new password
          </p>
          <Input
            placeholder="Reset token from your email"
            required
            value={recoveryToken}
            onChange={(e) => onRecoveryTokenChange(e.target.value)}
            className="w-full rounded-lg border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs focus:border-rica-500 focus:ring-rica-500/20"
          />
          <Input
            type="password"
            placeholder="New password (at least 8 characters)"
            minLength={8}
            autoComplete="new-password"
            required
            value={recoveryPassword}
            onChange={(e) => onRecoveryPasswordChange(e.target.value)}
            className="w-full rounded-lg border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs focus:border-rica-500 focus:ring-rica-500/20"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            minLength={8}
            autoComplete="new-password"
            required
            value={recoveryConfirm}
            onChange={(e) => onRecoveryConfirmChange(e.target.value)}
            className="w-full rounded-lg border-slate-700 bg-slate-900 text-white placeholder-slate-500 text-xs focus:border-rica-500 focus:ring-rica-500/20"
          />
          <Button
            disabled={isBusy}
            className="w-full rounded-lg bg-rica-500 hover:bg-rica-600 text-white text-xs font-semibold py-2 transition-all"
          >
            {isBusy ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      )}
    </div>
  );
}
