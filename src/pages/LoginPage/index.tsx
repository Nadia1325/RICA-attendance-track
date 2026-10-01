import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { RicaLogo } from "../../components/Brand";
import { Card } from "../../components/ui";
import { useAppSelector } from "../../app/hooks";
import { useApp } from "../../data/store";
import {
  errorMessage,
  useForgotPasswordMutation,
  useResetPasswordWithTokenMutation,
} from "../../services/api";

import { LoginBrandingHero } from "./LoginBrandingHero";
import { LoginForm } from "./LoginForm";
import { PasswordRecoveryForm } from "./PasswordRecoveryForm";

export function LoginPage() {
  const { currentUser, login } = useApp();
  const mustChangePassword = useAppSelector((s) => s.auth.mustChangePassword);

  const [forgotPassword] = useForgotPasswordMutation();
  const [resetWithToken] = useResetPasswordWithTokenMutation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Recovery state
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const ok = await login(identifier, password);
      if (!ok) {
        setError(
          "Invalid email/username or password, or this account has been deactivated.",
        );
      }
      // On success, currentUser is set and the redirect below takes over.
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRecoveryMessage("");
    setBusy(true);

    try {
      const result = await forgotPassword({
        identifier: recoveryEmail.trim(),
      }).unwrap();

      setRecoverySent(true);
      if (result.dev_token) {
        setRecoveryToken(result.dev_token);
      }
      setRecoveryMessage(
        result.dev_token
          ? "Development reset token received. Set a new password below."
          : "If an account matches that email or username, reset instructions have been sent. Enter the token from that message below.",
      );
    } catch (cause) {
      setError(errorMessage(cause, "Unable to request a password reset."));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRecoveryMessage("");

    if (recoveryPassword.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (recoveryPassword !== recoveryConfirm) {
      setError("The new password and confirmation do not match.");
      return;
    }

    setBusy(true);

    try {
      await resetWithToken({
        token: recoveryToken.trim(),
        new_password: recoveryPassword,
      }).unwrap();

      setShowForgot(false);
      setRecoverySent(false);
      setRecoveryToken("");
      setRecoveryPassword("");
      setRecoveryConfirm("");
      setRecoveryMessage(
        "Password reset successfully. Sign in with your new password.",
      );
    } catch (cause) {
      setError(errorMessage(cause, "Unable to reset your password."));
    } finally {
      setBusy(false);
    }
  }

  // All hooks are above this line, so this early return is safe.
  if (currentUser) {
    return (
      <Navigate to={mustChangePassword ? "/account/password" : "/"} replace />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans selection:bg-rica-500 selection:text-white">
      {/* Background Gradients & Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(98,180,69,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(15,23,42,0.9),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-rica-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LoginBrandingHero />
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <RicaLogo className="mx-auto mb-6 h-auto w-full max-w-[280px]" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Use the email or username assigned by your Admin, plus your
                password.
              </p>

              <LoginForm
                identifier={identifier}
                onIdentifierChange={setIdentifier}
                password={password}
                onPasswordChange={setPassword}
                onSubmit={handleLoginSubmit}
                isBusy={busy}
                error={error}
              />

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForgot((v) => !v)}
                    className="text-xs font-medium text-rica-700 hover:text-rica-800 transition-colors focus:outline-none focus:underline"
                >
                  Forgot your password?
                </button>
              </div>

              {recoveryMessage && (
                <p
                  role="status"
                    className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800 animate-in fade-in"
                >
                  {recoveryMessage}
                </p>
              )}

              {showForgot && (
                <PasswordRecoveryForm
                  recoverySent={recoverySent}
                  recoveryEmail={recoveryEmail}
                  onRecoveryEmailChange={setRecoveryEmail}
                  recoveryToken={recoveryToken}
                  onRecoveryTokenChange={setRecoveryToken}
                  recoveryPassword={recoveryPassword}
                  onRecoveryPasswordChange={setRecoveryPassword}
                  recoveryConfirm={recoveryConfirm}
                  onRecoveryConfirmChange={setRecoveryConfirm}
                  onRequestReset={(e) => void handleRequestReset(e)}
                  onResetPassword={(e) => void handleResetPassword(e)}
                  isBusy={busy}
                />
              )}

              <p className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-600">
                <ShieldCheck size={14} className="shrink-0 text-rica-400" />
                <span>
                  Authorized RICA staff only. Activity is recorded in the audit
                  log.
                </span>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;