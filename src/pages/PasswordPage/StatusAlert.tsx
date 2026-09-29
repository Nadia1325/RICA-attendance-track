// src/pages/PasswordPage/StatusAlert.tsx
interface StatusAlertProps {
  error?: string;
  message?: string;
}

export function StatusAlert({ error, message }: StatusAlertProps) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
      >
        {error}
      </p>
    );
  }

  if (message) {
    return (
      <p
        role="status"
        className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
      >
        {message}
      </p>
    );
  }

  return null;
}