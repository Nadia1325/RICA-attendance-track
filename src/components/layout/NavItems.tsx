import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./navConfig"; // ← imports the array
import { can } from "../../lib/permissions";
import { cn } from "../../lib/utils";

interface NavItemsProps {
  currentUser: any;
  openFlags: number;
  mobile?: boolean;
  collapsed?: boolean;
  badgeCounts?: Record<string, number>;
  onItemClick?: () => void;
}

// ✅ Named export = NavItems (PascalCase, component)
export const NavItems: React.FC<NavItemsProps> = ({
  currentUser,
  openFlags,
  mobile = false,
  collapsed = false,
  badgeCounts = {},
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
          const badgeCount = badgeCounts[item.to] ?? 0;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={cn(
              "group sidebar-link relative flex min-w-0 items-center rounded-xl py-2.5 text-xs font-semibold transition-all duration-200",
              collapsed && !mobile ? "justify-center px-2" : "gap-3 px-3",
              active
                ? "bg-rica-500 text-white shadow-md shadow-rica-500/20"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200",
            )}
            title={collapsed && !mobile ? item.label : undefined}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 transition-colors",
                active
                  ? "text-white"
                  : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200",
              )}
            />
            {(!collapsed || mobile) && (
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            )}
            {badgeCount > 0 && (
              <span
                className={cn(
                  collapsed && !mobile ? "absolute -right-1 -top-1 px-1" : "",
                  "rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors",
                  active
                    ? "bg-slate-950/40 text-white"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                )}
              >
                {badgeCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
