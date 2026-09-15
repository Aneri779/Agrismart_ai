import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './components/layout/RoleGuard';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';

// Farmer/User Pages
import { DashboardPage } from './pages/user/DashboardPage';
import { ScanPage } from './pages/user/ScanPage';
import { ResultsPage } from './pages/user/ResultsPage';
import { HistoryPage } from './pages/user/HistoryPage';
import { AssistantPage } from './pages/user/AssistantPage';
import { SustainabilityPage } from './pages/user/SustainabilityPage';
import { SettingsPage } from './pages/user/SettingsPage';
import { WeatherPage } from './pages/user/WeatherPage';
import { IrrigationAdvisorPage } from './pages/user/IrrigationAdvisorPage';

// Admin Pages & Layout
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CropManagement } from './pages/admin/CropManagement';
import { WeatherAnalytics } from './pages/admin/WeatherAnalytics';
import { IrrigationSystem } from './pages/admin/IrrigationSystem';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { AlertsNotifications } from './pages/admin/AlertsNotifications';
import { SystemLogs } from './pages/admin/SystemLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Farmer Routes */}
            <Route path="/dashboard" element={<RoleGuard requireRole="farmer"><DashboardPage /></RoleGuard>} />
            <Route path="/scan" element={<RoleGuard requireRole="farmer"><ScanPage /></RoleGuard>} />
            <Route path="/results/:scanId" element={<RoleGuard requireRole="farmer"><ResultsPage /></RoleGuard>} />
            <Route path="/history" element={<RoleGuard requireRole="farmer"><HistoryPage /></RoleGuard>} />
            <Route path="/assistant" element={<RoleGuard requireRole="farmer"><AssistantPage /></RoleGuard>} />
            <Route path="/sustainability" element={<RoleGuard requireRole="farmer"><SustainabilityPage /></RoleGuard>} />
            <Route path="/settings" element={<RoleGuard requireRole="farmer"><SettingsPage /></RoleGuard>} />
            <Route path="/weather" element={<RoleGuard requireRole="farmer"><WeatherPage /></RoleGuard>} />
            <Route path="/irrigation" element={<RoleGuard requireRole="farmer"><IrrigationAdvisorPage /></RoleGuard>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<RoleGuard requireRole="admin"><AdminLayout /></RoleGuard>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="crops" element={<CropManagement />} />
              <Route path="weather" element={<WeatherAnalytics />} />
              <Route path="irrigation" element={<IrrigationSystem />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="alerts" element={<AlertsNotifications />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
