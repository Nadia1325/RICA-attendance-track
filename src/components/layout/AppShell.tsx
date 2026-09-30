import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { loggedOut } from "../../features/auth/authSlice";
import { useGetAnomaliesQuery } from "../../services/attendanceApi";

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

  const { data: anomalies = [] } = useGetAnomaliesQuery();
  const openFlags = anomalies.filter((a) => !a.resolved).length;

  const handleLogout = () => {
    dispatch(loggedOut());
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-rica-500 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="sidebar-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur-xl lg:flex">
        <div className="sidebar-brand border-b border-slate-800/80 px-5 py-4">
          <Brand />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-800">
          <NavItems currentUser={currentUser} openFlags={openFlags} />{" "}
          {/* ✅ */}
        </div>
        <div className="border-t border-slate-800/80 bg-slate-900/50 p-2">
          <UserFooter currentUser={currentUser} onLogout={handleLogout} />
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
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
