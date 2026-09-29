// src/components/layout/navConfig.ts
import { 
  Activity, 
  AlertTriangle, 
  Building2, 
  CalendarDays, 
  ClipboardCheck, 
  FileSpreadsheet, 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Clock3, 
  ScrollText, 
  BarChart3, 
  Database, 
  Upload, 
  KeyRound,
  LucideIcon 
} from "lucide-react";

export interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  feature?: "upload" | "verify" | "dailyReport" | "monthlyReport" | "kpis" | "manageUsers";
}

export const NAV_ITEMS: NavItemConfig[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Data import", icon: Upload, feature: "upload" },
  { to: "/raw", label: "Raw attendance", icon: Database },
  { to: "/verification", label: "Verification", icon: AlertTriangle, feature: "verify" },
  { to: "/attendance", label: "Verified records", icon: ClipboardCheck },
  { to: "/leaves", label: "Leave management", icon: CalendarDays },
  { to: "/reports/daily", label: "Daily report", icon: FileSpreadsheet, feature: "dailyReport" },
  { to: "/reports/monthly", label: "Monthly report", icon: BarChart3, feature: "monthlyReport" },
  { to: "/performance", label: "Performance KPIs", icon: Activity, feature: "kpis" },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/organization", label: "Organization", icon: Building2 },
  { to: "/shifts", label: "Shifts", icon: Clock3 },
  { to: "/holidays", label: "Holidays", icon: CalendarDays },
  { to: "/users", label: "Users & config", icon: UserCog, feature: "manageUsers" },
  { to: "/audit", label: "Audit logs", icon: ScrollText, feature: "manageUsers" },
  { to: "/account/password", label: "Change password", icon: KeyRound },
];