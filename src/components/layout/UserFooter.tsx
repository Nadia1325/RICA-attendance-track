import React from "react";
import { LogOut } from "lucide-react";
import { roleLabel } from "../../lib/utils";

interface UserFooterProps {
  currentUser: any;
  onLogout: () => void;
}

export const UserFooter: React.FC<UserFooterProps> = ({
  currentUser,
  onLogout,
}) => {
  return (
    <div className="sidebar-footer shrink-0 border-t border-slate-800/80 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rica-500/15 border border-rica-500/30 text-rica-400 text-xs font-bold shadow-sm">
          {currentUser?.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-100 leading-tight">
            {currentUser?.name}
          </p>
          <p className="truncate text-[10px] font-medium text-slate-400 mt-0.5">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};
