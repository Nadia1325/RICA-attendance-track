import { type FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "../../components/ui";

interface LoginFormProps {
  identifier: string;
  onIdentifierChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isBusy: boolean;
  error?: string;
}

export function LoginForm({
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  onSubmit,
  isBusy,
  error,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="identifier"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          Email or username
        </label>
        <Input
          id="identifier"
          value={identifier}
          onChange={(e) => onIdentifierChange(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          className="w-full rounded-xl border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 focus:border-rica-500 focus:ring-rica-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            className="w-full rounded-xl border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 pr-11 focus:border-rica-500 focus:ring-rica-500/20"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-300 animate-in fade-in"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full rounded-xl bg-rica-500 hover:bg-rica-600 active:bg-rica-700 text-white font-semibold py-2.5 shadow-lg shadow-rica-500/20 transition-all disabled:opacity-50"
        disabled={isBusy}
      >
        {isBusy ? "Signing in…" : "Continue to workspace"}
      </Button>
    </form>
  );
}
