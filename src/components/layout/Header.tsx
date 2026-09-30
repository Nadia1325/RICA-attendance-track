import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Shield, LogOut } from "lucide-react";
import { RwandaEmblem } from "../Brand";
import { roleLabel } from "../../lib/utils";

interface HeaderProps {
  currentUser: any;
  openFlags: number;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  openFlags,
  onOpenMobileMenu,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3.5 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-rica-500/40 transition-colors lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-400">
          <RwandaEmblem className="h-7 w-auto shrink-0 filter drop-shadow-sm" />
          <span className="hidden truncate font-semibold text-slate-200 md:inline">
            Republic of Rwanda
          </span>
          <span className="hidden text-slate-700 md:inline">·</span>
          <Shield size={15} className="shrink-0 text-rica-400" />
          <span className="truncate font-medium text-slate-300">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {openFlags > 0 && (
          <button
            onClick={() => navigate("/verification")}
            className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all sm:block"
          >
            {openFlags} anomalies to review
          </button>
        )}
        <div className="hidden min-w-0 text-right sm:block">
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            {currentUser?.name}
          </p>
          <p className="max-w-[240px] truncate text-xs text-slate-400">
            {currentUser?.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors lg:hidden"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
