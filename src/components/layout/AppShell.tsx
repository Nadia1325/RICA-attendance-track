import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { loggedOut } from "../../features/auth/authSlice";
import { useGetAnomaliesQuery, useGetBatchesQuery } from "../../services/attendanceApi";
import { useGetLeavesQuery } from "../../services/leaveApi";

import { Brand } from "./Brand";
import { Header } from "./Header";
import { NavItems } from "./NavItems"; // ✅ FIXED — was Nav_Items
import { UserFooter } from "./UserFooter";
import { cn } from "../../lib/utils";

export function AppShell() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("rica-sidebar-collapsed") === "1",
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("rica-theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("rica-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("rica-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  const { data: anomalies = [] } = useGetAnomaliesQuery();
  const openFlags = anomalies.filter((a) => !a.resolved).length;
  const { data: batches = [] } = useGetBatchesQuery();
  const { data: leaves = [] } = useGetLeavesQuery();
  const badgeCounts = {
    "/verification": openFlags,
    "/upload": batches.length,
    "/raw": batches.length,
    "/leaves": leaves.length,
  };

  const handleLogout = () => {
    dispatch(loggedOut());
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <div
      className={cn(
        "flex min-h-screen font-sans selection:bg-rica-500 selection:text-white",
        darkMode ? "bg-slate-950" : "bg-slate-100",
      )}
    >
      {/* Desktop Sidebar */}
      <aside className={cn(
        "sidebar-panel sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r shadow-xl backdrop-blur-xl transition-[width,background-color,border-color] duration-200 lg:flex",
        sidebarCollapsed ? "w-20" : "w-64",
        darkMode ? "border-slate-800/80 bg-slate-900/90 text-slate-100" : "border-slate-200 bg-white/95 text-slate-800",
      )}>
        <div className={cn(
          "sidebar-brand flex items-start border-b px-3 py-4",
          sidebarCollapsed ? "justify-center" : "justify-between",
          darkMode ? "border-slate-800/80" : "border-slate-200",
        )}>
          <Brand collapsed={sidebarCollapsed} />
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-800">
          <NavItems currentUser={currentUser} openFlags={openFlags} badgeCounts={badgeCounts} collapsed={sidebarCollapsed} />
        </div>
        <div className={cn(
          "border-t p-2",
          darkMode ? "border-slate-800/80 bg-slate-900/50" : "border-slate-200 bg-slate-50",
        )}>
          <UserFooter currentUser={currentUser} onLogout={handleLogout} collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="sidebar-brand flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-rica-500/40 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <NavItems
            currentUser={currentUser}
            openFlags={openFlags}
            badgeCounts={badgeCounts}
            mobile
            onItemClick={() => setMobileOpen(false)}
          />
        </div>
        <div className="border-t border-slate-800 bg-slate-900/50 p-2">
          <UserFooter currentUser={currentUser} onLogout={handleLogout} />
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          currentUser={currentUser}
          openFlags={openFlags}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((value) => !value)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 bg-slate-100 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
