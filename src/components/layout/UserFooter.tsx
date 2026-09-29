// src/components/layout/UserFooter.tsx
import React from "react";
import { LogOut } from "lucide-react";
import { roleLabel } from "../../lib/utils";

interface UserFooterProps {
  currentUser: any;
  onLogout: () => void;
}

export const UserFooter: React.FC<UserFooterProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="sidebar-footer shrink-0 border-t border-white/10 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold">
          {currentUser?.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{currentUser?.name}</p>
          <p className="truncate text-[10px] text-teal-200/80">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 rounded-lg p-2 text-teal-200 hover:bg-white/10"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
};