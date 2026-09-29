// src/components/layout/NavItems.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./navConfig";
import { can } from "../../lib/permissions";
import { cn } from "../../lib/utils";

interface NavItemsProps {
  currentUser: any;
  openFlags: number;
  mobile?: boolean;
  onItemClick?: () => void;
}

export const NavItems: React.FC<NavItemsProps> = ({
  currentUser,
  openFlags,
  mobile = false,
  onItemClick,
}) => {
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.feature || (currentUser && can(currentUser.role, item.feature))
  );

  return (
    <nav className={cn("sidebar-nav space-y-0.5", mobile ? "px-2 py-2" : "px-2 py-2")}>
      {visibleNav.map((item) => {
        const Icon = item.icon;
        const active =
          item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={cn(
              "sidebar-link flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
              active
                ? "bg-white/10 text-white"
                : "text-teal-100/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={14} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.to === "/verification" && openFlags > 0 && (
              <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-teal-950">
                {openFlags}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};