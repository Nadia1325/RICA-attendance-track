// src/components/layout/Header.tsx
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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RwandaEmblem className="h-8 w-auto shrink-0" />
          <span className="hidden truncate font-semibold text-slate-700 md:inline">
            Republic of Rwanda
          </span>
          <span className="hidden text-slate-300 md:inline">·</span>
          <Shield size={15} className="shrink-0 text-teal-700" />
          <span className="truncate">
            {currentUser ? roleLabel(currentUser.role) : ""}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {openFlags > 0 && (
          <button
            onClick={() => navigate("/verification")}
            className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 sm:block"
          >
            {openFlags} anomalies to review
          </button>
        )}
        <div className="hidden min-w-0 text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
          <p className="max-w-[240px] truncate text-xs text-slate-500">
            {currentUser?.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
};