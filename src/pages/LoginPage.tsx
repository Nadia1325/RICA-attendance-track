import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../data/store";
import { Button, Card, Input } from "../components/ui";
import { Eye, EyeOff, Fingerprint } from "lucide-react";
import { apiConfigured } from "../lib/api";
import { apiRequest } from "../lib/api";

const demos = [
  { identifier: "admin@rica.rw", password: "Admin@123", label: "Admin · HR/System" },
  { identifier: "Jean Bosco Niyonzima", password: "HOD@123", label: "Head of Department" },
  { identifier: "hou@rica.rw", password: "HOU@123", label: "Head of Office/Unit" },
  { identifier: "director@rica.rw", password: "Director@123", label: "Director" },
];

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("admin@rica.rw");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ok = await login(identifier, password);
      if (!ok) {
        setError("Invalid name/email or password, or this account has been removed.");
        return;
      }
      navigate("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(demo: (typeof demos)[number]) {
    setIdentifier(demo.identifier);
    setPassword(demo.password);
    setError("");
    const ok = await login(demo.identifier, demo.password);
    if (ok) navigate("/");
  }

  async function requestReset(e: FormEvent) {
    e.preventDefault(); setError(""); setRecoveryMessage(""); setBusy(true);
    try {
      const result = await apiRequest<{ message?: string; dev_token?: string }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ identifier: recoveryEmail.trim() }) });
      setRecoverySent(true);
      if (result.dev_token) setRecoveryToken(result.dev_token);
      setRecoveryMessage(result.dev_token ? "Development reset token received. Set a new password below." : "If an account matches that email or username, reset instructions have been sent. Enter the token from that message below.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to request a password reset."); }
    finally { setBusy(false); }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault(); setError(""); setRecoveryMessage("");
    if (recoveryPassword.length < 8) { setError("Use at least 8 characters for your new password."); return; }
    if (recoveryPassword !== recoveryConfirm) { setError("The new password and confirmation do not match."); return; }
    setBusy(true);
    try {
      await apiRequest("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token: recoveryToken.trim(), new_password: recoveryPassword }) });
      setShowForgot(false); setRecoverySent(false); setRecoveryToken(""); setRecoveryPassword(""); setRecoveryConfirm("");
      setRecoveryMessage("Password reset successfully. Sign in with your new password.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reset your password."); }
    finally { setBusy(false); }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-teal-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(13,148,136,0.25),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div className="text-white">
            <div className="mb-8 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500">
                <Fingerprint />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-200">RICA</p>
                <p className="text-lg font-semibold">Attendance Tracking & Management</p>
              </div>
            </div>
            <h1 className="max-w-lg text-4xl font-bold leading-tight">
              Centralized attendance for every office, shift, and fingerprint device.
            </h1>
            <p className="mt-4 max-w-lg text-teal-100/80">
              Import daily device exports, resolve anomalies, record leave, and deliver an 8-column director report without spreadsheet work.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-teal-50/90 sm:grid-cols-2">
              {["20-column raw import", "Anomaly review queue", "Leave → LV status", "Attendance & punctuality KPIs", "Role-based access", "Full audit trail"].map((item) => (
                <li key={item} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">{item}</li>
              ))}
            </ul>
          </div>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use the Gmail/work email or the name assigned by your Admin, plus your password.</p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Gmail / work email / name</label>
                <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
                <div className="relative">
                  <Input className="pr-11" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Continue to workspace"}</Button>
            </form>

            <button type="button" onClick={() => setShowForgot((v) => !v)} className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-800">
              Forgot your password?
            </button>
            {recoveryMessage && <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">{recoveryMessage}</p>}
            {showForgot && <div className="mt-3 rounded-xl border border-slate-200 p-4">
              {!apiConfigured ? <p className="text-xs leading-5 text-amber-900">This frontend-only demo has no email reset service. Ask an Admin to reset your password from Users &amp; configuration.</p> : <>
                {!recoverySent ? <form className="space-y-3" onSubmit={(e) => void requestReset(e)}><p className="text-sm font-semibold">Request password reset</p><Input type="email" placeholder="Account email" autoComplete="email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} /><Button disabled={busy}>{busy ? "Requesting…" : "Send reset instructions"}</Button></form> : <form className="space-y-3" onSubmit={(e) => void resetPassword(e)}><p className="text-sm font-semibold">Choose a new password</p><Input placeholder="Reset token from your email" required value={recoveryToken} onChange={(e) => setRecoveryToken(e.target.value)} /><Input type="password" placeholder="New password (at least 8 characters)" minLength={8} autoComplete="new-password" required value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} /><Input type="password" placeholder="Confirm new password" minLength={8} autoComplete="new-password" required value={recoveryConfirm} onChange={(e) => setRecoveryConfirm(e.target.value)} /><Button disabled={busy}>{busy ? "Resetting…" : "Reset password"}</Button></form>}
              </>}
            </div>}

            <div className="mt-6 space-y-2">
              {!apiConfigured && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>}
              {!apiConfigured && demos.map((d) => (
                <button key={d.identifier} type="button" onClick={() => void quickLogin(d)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:bg-teal-50">
                  <span className="font-medium text-slate-800">{d.label}</span>
                  <span className="text-xs text-slate-500">{d.identifier}</span>
                </button>
              ))}
              {!apiConfigured && <p className="pt-2 text-[11px] text-slate-400">Demo passwords are for this frontend prototype only.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
