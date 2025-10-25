import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import PlannerPage from './features/planner/PlannerPage';
import InboxPage from './features/inbox/InboxPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import ContentStudioPage from './features/content/ContentStudioPage';
import CompliancePage from './features/compliance/CompliancePage';
import BrandRagPage from './features/rag/BrandRagPage';
import ConnectionsPage from './features/settings/ConnectionsPage';
import CompetitorAnalysisPage from './features/competitors/CompetitorAnalysisPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="content-studio" element={<ContentStudioPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="brand-rag" element={<BrandRagPage />} />
          <Route path="settings" element={<ConnectionsPage />} />
          <Route path="competitor-analysis" element={<CompetitorAnalysisPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;