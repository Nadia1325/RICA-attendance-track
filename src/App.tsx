import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useApp } from "./data/store";
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const UploadPage = lazy(() => import("./pages/UploadPage").then((m) => ({ default: m.UploadPage })));
const RawAttendancePage = lazy(() => import("./pages/RawAttendancePage").then((m) => ({ default: m.RawAttendancePage })));
const VerificationPage = lazy(() => import("./pages/VerificationPage").then((m) => ({ default: m.VerificationPage })));
const AttendancePage = lazy(() => import("./pages/AttendancePage").then((m) => ({ default: m.AttendancePage })));
const LeavesPage = lazy(() => import("./pages/LeavesPage").then((m) => ({ default: m.LeavesPage })));
const DailyReportPage = lazy(() => import("./pages/DailyReportPage").then((m) => ({ default: m.DailyReportPage })));
const MonthlyReportPage = lazy(() => import("./pages/MonthlyReportPage").then((m) => ({ default: m.MonthlyReportPage })));
const PerformancePage = lazy(() => import("./pages/PerformancePage").then((m) => ({ default: m.PerformancePage })));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage").then((m) => ({ default: m.EmployeesPage })));
const OrganizationPage = lazy(() => import("./pages/OrganizationPage").then((m) => ({ default: m.OrganizationPage })));
const ShiftsPage = lazy(() => import("./pages/ShiftsPage").then((m) => ({ default: m.ShiftsPage })));
const HolidaysPage = lazy(() => import("./pages/HolidaysPage").then((m) => ({ default: m.HolidaysPage })));
const UsersPage = lazy(() => import("./pages/UsersPage").then((m) => ({ default: m.UsersPage })));
const AuditPage = lazy(() => import("./pages/AuditPage").then((m) => ({ default: m.AuditPage })));
const PasswordPage = lazy(() => import("./pages/PasswordPage").then((m) => ({ default: m.PasswordPage })));

function Guard({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (sessionStorage.getItem("rica-api-force-password-change") === "1" && location.pathname !== "/account/password") return <Navigate to="/account/password" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-500">Loading RICA Attendance…</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/raw" element={<RawAttendancePage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/reports/daily" element={<DailyReportPage />} />
        <Route path="/reports/monthly" element={<MonthlyReportPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/shifts" element={<ShiftsPage />} />
        <Route path="/holidays" element={<HolidaysPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/account/password" element={<PasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
