import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Activity, AlertTriangle, Building2, CalendarDays, ClipboardCheck, FileSpreadsheet, LayoutDashboard, LogOut, Shield, Upload, Users, UserCog, Clock3, ScrollText, BarChart3, Database, Menu, X } from "lucide-react";
import { useApp } from "../data/store";
import { can } from "../lib/permissions";
import { cn, roleLabel } from "../lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Data import", icon: Upload, feature: "upload" as const },
  { to: "/raw", label: "Raw attendance", icon: Database },
  { to: "/verification", label: "Verification", icon: AlertTriangle, feature: "verify" as const },
  { to: "/attendance", label: "Verified records", icon: ClipboardCheck },
  { to: "/leaves", label: "Leave management", icon: CalendarDays },
  { to: "/reports/daily", label: "Daily report", icon: FileSpreadsheet, feature: "dailyReport" as const },
  { to: "/reports/monthly", label: "Monthly report", icon: BarChart3, feature: "monthlyReport" as const },
  { to: "/performance", label: "Performance KPIs", icon: Activity, feature: "kpis" as const },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/organization", label: "Organization", icon: Building2 },
  { to: "/shifts", label: "Shifts", icon: Clock3 },
  { to: "/holidays", label: "Holidays", icon: CalendarDays },
  { to: "/users", label: "Users & config", icon: UserCog, feature: "manageUsers" as const },
  { to: "/audit", label: "Audit logs", icon: ScrollText, feature: "manageUsers" as const },
];

export function AppShell() {
  const { currentUser, logout, scopedAnomalies } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openFlags = scopedAnomalies().filter((a) => !a.resolved).length;

  const visibleNav = nav.filter((item) => !item.feature || (currentUser && can(currentUser.role, item.feature)));

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-0.5", mobile ? "px-3 py-4" : "overflow-y-auto px-3 py-4")}>
      {visibleNav.map((item) => {
        const Icon = item.icon;
        const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
        return <NavLink key={item.to} to={item.to} onClick={() => mobile && setMobileOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-white/10 text-white" : "text-teal-100/70 hover:bg-white/5 hover:text-white")}>
          <Icon size={16} /><span className="flex-1">{item.label}</span>
          {item.to === "/verification" && openFlags > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-teal-950">{openFlags}</span>}
        </NavLink>;
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#f3f6f5]">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-teal-950 text-teal-50 lg:flex">
        <div className="border-b border-white/10 px-5 py-5"><Brand /></div>
        <div className="flex-1"><NavItems /></div>
        <UserFooter />
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col bg-teal-950 text-teal-50 shadow-2xl transition-transform lg:hidden", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><Brand /><button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-teal-100 hover:bg-white/10"><X size={19} /></button></div>
        <div className="flex-1 overflow-y-auto"><NavItems mobile /></div>
        <UserFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-2"><button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="flex items-center gap-2 text-sm text-slate-500"><Shield size={16} className="text-teal-700" /><span className="truncate">Role-based access · {currentUser ? roleLabel(currentUser.role) : ""}</span></div></div>
          <div className="flex items-center gap-3">{openFlags > 0 && <button onClick={() => navigate("/verification")} className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 sm:block">{openFlags} anomalies to review</button>}<div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p><p className="max-w-[240px] truncate text-xs text-slate-500">{currentUser?.email}</p></div><button onClick={() => { logout(); navigate("/login"); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" title="Sign out"><LogOut size={17} /></button></div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 lg:px-8"><Outlet /></main>
      </div>
    </div>
  );

  function Brand() { return <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 font-black text-white">R</div><div><p className="text-sm font-bold tracking-wide">RICA</p><p className="text-[11px] text-teal-200/80">Attendance Management</p></div></div>; }
  function UserFooter() { return <div className="border-t border-white/10 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-xs font-bold">{currentUser?.avatarInitials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{currentUser?.name}</p><p className="truncate text-[11px] text-teal-200/80">{currentUser ? roleLabel(currentUser.role) : ""}</p></div><button onClick={() => { logout(); navigate("/login"); setMobileOpen(false); }} className="rounded-lg p-2 text-teal-200 hover:bg-white/10" title="Sign out"><LogOut size={16} /></button></div></div>; }
}
