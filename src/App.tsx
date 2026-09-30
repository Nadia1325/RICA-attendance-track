// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";

import AttendancePage from "./pages/AttendancePage";
import AuditPage from "./pages/AuditPage";
import DailyReportPage from "./pages/DailyReportPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import HolidaysPage from "./pages/HolidaysPage";
import LeavesPage from "./pages/LeavesPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import OrganizationPage from "./pages/OrganizationPage";
import PasswordPage from "./pages/PasswordPage";
import PerformancePage from "./pages/PerformancePage";
import RawAttendancePage from "./pages/RawAttendancePage";
import ShiftsPage from "./pages/ShiftsPage";
import UploadPage from "./pages/UploadPage";
import UsersPage from "./pages/UsersPage";
import VerificationPage from "./pages/VerificationPage"

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected under AppShell */}
      <Route element={<AppShell />}>
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;