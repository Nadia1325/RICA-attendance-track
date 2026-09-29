// src/pages/LoginPage/LoginForm.tsx
import { FormEvent, useState } from "react";
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
          className="mb-1 block text-xs font-semibold text-slate-600"
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
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-xs font-semibold text-slate-600"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            className="pr-11"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isBusy}>
        {isBusy ? "Signing in…" : "Continue to workspace"}
      </Button>
    </form>
  );
}