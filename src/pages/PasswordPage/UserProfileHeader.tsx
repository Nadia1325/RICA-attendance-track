// src/pages/PasswordPage/UserProfileHeader.tsx
import { KeyRound } from "lucide-react";

interface UserProfileHeaderProps {
  userName?: string;
}

export function UserProfileHeader({ userName }: UserProfileHeaderProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
        <KeyRound size={20} />
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">
          {userName ?? "Account Holder"}
        </h2>
        <p className="text-xs text-slate-500">
          Only you can change your password here.
        </p>
      </div>
    </div>
  );
}