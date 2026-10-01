import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Shield, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { RwandaEmblem } from "../Brand";
import { roleLabel } from "../../lib/utils";

interface HeaderProps {
  currentUser: any;
  openFlags: number;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  openFlags,
  darkMode,
  onToggleTheme,
  onOpenMobileMenu,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3.5 backdrop-blur-md transition-colors lg:px-8 ${
      darkMode
        ? "border-slate-800/80 bg-slate-900/80"
        : "border-slate-200 bg-white/90"
    }`}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-rica-500/40 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
          <RwandaEmblem className="h-7 w-auto shrink-0 filter drop-shadow-sm" />
          <span className="hidden truncate font-semibold text-slate-800 dark:text-slate-200 md:inline">
            Republic of Rwanda
          </span>
          <span className="hidden text-slate-700 md:inline">·</span>
          <Shield size={15} className="shrink-0 text-rica-400" />
          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={darkMode ? "Use light mode" : "Use dark mode"}
          title={darkMode ? "Use light mode" : "Use dark mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={() => navigate("/account/password")}
          className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 sm:flex"
          title="Open profile"
          aria-label="Open profile"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rica-500/15 text-xs font-bold text-rica-700 ring-1 ring-rica-500/30 dark:text-rica-300">
            {currentUser?.avatarInitials || <UserRound size={16} />}
          </span>
          <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-200 md:block">
            Profile
          </span>
        </button>
        {openFlags > 0 && (
          <button
            onClick={() => navigate("/verification")}
            className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all sm:block"
          >
            {openFlags} anomalies to review
          </button>
        )}
        <div className="hidden min-w-0 text-right sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-snug dark:text-slate-100">
            {currentUser?.name}
          </p>
          <p className="max-w-[240px] truncate text-xs text-slate-500 dark:text-slate-400">
            {currentUser?.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-rose-600 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 lg:hidden"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
