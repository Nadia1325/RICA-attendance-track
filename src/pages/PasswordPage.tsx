import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button, Card, Input, PageHeader } from "../components/ui";
import { apiConfigured, apiRequest } from "../lib/api";
import { useApp } from "../data/store";
import { useNavigate } from "react-router-dom";

export function PasswordPage() {
  const { currentUser } = useApp();
  const { logout } = useApp();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (password.length < 8) { setError("Use at least 8 characters for your new password."); return; }
    if (password !== confirm) { setError("The new password and confirmation do not match."); return; }
    const token = localStorage.getItem("rica-api-access-token");
    if (!apiConfigured || !token) { setError("Password changes require an active connection to the RICA backend."); return; }
    setBusy(true);
    try {
      await apiRequest("/api/auth/change-password", { method: "POST", body: JSON.stringify({ current_password: currentPassword, new_password: password }) }, token);
      const refreshToken = localStorage.getItem("rica-api-refresh-token");
      if (refreshToken) {
        try {
          const renewed = await apiRequest<{ access_token: string }>("/api/auth/refresh", {}, refreshToken);
          await apiRequest("/api/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }, renewed.access_token);
        } catch { /* Password is already changed; local sign-out still completes below. */ }
      }
      sessionStorage.removeItem("rica-api-force-password-change");
      logout();
      navigate("/login", { replace: true });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to change your password."); }
    finally { setBusy(false); }
  }

  return <div><PageHeader title="Change password" subtitle="Update your own account password securely through the RICA backend." />
    <Card className="max-w-xl p-6"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-teal-50 p-3 text-teal-700"><KeyRound size={20} /></span><div><h2 className="font-semibold">{currentUser?.name}</h2><p className="text-xs text-slate-500">Only you can change your password here.</p></div></div>
      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        <label className="block text-sm font-medium">Current password<Input className="mt-1" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
        <label className="block text-sm font-medium">New password<Input className="mt-1" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span></label>
        <label className="block text-sm font-medium">Confirm new password<Input className="mt-1" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        <Button disabled={busy}>{busy ? "Saving…" : "Change password"}</Button>
      </form>
    </Card>
  </div>;
}
