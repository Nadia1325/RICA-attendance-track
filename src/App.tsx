import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useApp } from "./data/store";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { RawAttendancePage } from "./pages/RawAttendancePage";
import { VerificationPage } from "./pages/VerificationPage";
import { AttendancePage } from "./pages/AttendancePage";
import { LeavesPage } from "./pages/LeavesPage";
import { DailyReportPage } from "./pages/DailyReportPage";
import { MonthlyReportPage } from "./pages/MonthlyReportPage";
import { PerformancePage } from "./pages/PerformancePage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { OrganizationPage } from "./pages/OrganizationPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { HolidaysPage } from "./pages/HolidaysPage";
import { UsersPage } from "./pages/UsersPage";
import { AuditPage } from "./pages/AuditPage";

function Guard({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
