import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./navConfig"; // ← imports the array
import { can } from "../../lib/permissions";
import { cn } from "../../lib/utils";

interface NavItemsProps {
  currentUser: any;
  openFlags: number;
  mobile?: boolean;
  onItemClick?: () => void;
}

// ✅ Named export = NavItems (PascalCase, component)
export const NavItems: React.FC<NavItemsProps> = ({
  currentUser,
  openFlags,
  mobile = false,
  onItemClick,
}) => {
  const location = useLocation();

  const visibleNav = NAV_ITEMS.filter(
    (item) =>
      !item.feature || (currentUser && can(currentUser.role, item.feature)),
  );

  return (
    <nav
      className={cn(
        "sidebar-nav space-y-1",
        mobile ? "px-2 py-2" : "px-2 py-2",
      )}
    >
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
              "sidebar-link flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
              active
                ? "bg-rica-500 text-white shadow-md shadow-rica-500/20"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 transition-colors",
                active
                  ? "text-white"
                  : "text-slate-400 group-hover:text-slate-200",
              )}
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.to === "/verification" && openFlags > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors",
                  active
                    ? "bg-slate-950/40 text-white"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                )}
              >
                {openFlags}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
