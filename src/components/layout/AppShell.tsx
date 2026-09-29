// src/components/layout/AppShell.tsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useApp } from "../../data/store";
import { Brand } from "./Brand";
import { Header } from "./Header";
import { NavItems } from "./NavItems";
import { UserFooter } from "./UserFooter";
import { cn } from "../../lib/utils";

export function AppShell() {
  const { currentUser, logout, scopedAnomalies } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openFlags = scopedAnomalies().filter((a) => !a.resolved).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f3f6f5]">
      {/* Desktop Sidebar */}
      <aside className="sidebar-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden bg-teal-950 text-teal-50 lg:flex">
        <div className="sidebar-brand border-b border-white/10 px-4 py-3">
          <Brand />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavItems currentUser={currentUser} openFlags={openFlags} />
        </div>
        <UserFooter currentUser={currentUser} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col overflow-hidden bg-teal-950 text-teal-50 shadow-2xl transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="sidebar-brand flex items-center justify-between border-b border-white/10 px-4 py-3">
          <Brand />
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-teal-100 hover:bg-white/10"
          >
            <X size={19} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavItems
            currentUser={currentUser}
            openFlags={openFlags}
            mobile
            onItemClick={() => setMobileOpen(false)}
          />
        </div>
        <UserFooter currentUser={currentUser} onLogout={handleLogout} />
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          currentUser={currentUser}
          openFlags={openFlags}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}