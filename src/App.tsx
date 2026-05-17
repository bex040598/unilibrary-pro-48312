import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./app/dashboard/page";
import { AssetsPage } from "./app/assets/page";
import { ThreatsPage } from "./app/threats/page";
import { VulnerabilitiesPage } from "./app/vulnerabilities/page";
import { ControlsPage } from "./app/controls/page";
import { RiskAssessmentPage } from "./app/risk-assessment/page";
import { RiskMatrixPage } from "./app/risk-matrix/page";
import { HeatmapPage } from "./app/heatmap/page";
import { RecommendationsPage } from "./app/recommendations/page";
import { ReportsPage } from "./app/reports/page";
import { AuditLogsPage } from "./app/audit-logs/page";
import { UsersPage } from "./app/users/page";
import { SettingsPage } from "./app/settings/page";
import { LoginPage } from "./app/login/page";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingSkeleton } from "./components/ui/LoadingSkeleton";
import { usePlatform } from "./lib/platform-context";

function ProtectedLayout() {
  const { currentUser, loading } = usePlatform();

  if (loading) {
    return <LoadingSkeleton variant="screen" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="/controls" element={<ControlsPage />} />
          <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
          <Route path="/risk-matrix" element={<RiskMatrixPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
