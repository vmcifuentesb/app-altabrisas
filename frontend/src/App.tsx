import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TowersPage } from './pages/TowersPage';
import { ApartmentsPage } from './pages/ApartmentsPage';
import { ApartmentDetailPage } from './pages/ApartmentDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { ContractsPage } from './pages/ContractsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AuditRequestsPage } from './pages/AuditRequestsPage';
import { ClientPortalPage } from './pages/ClientPortalPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-semibold font-display">
        Cargando sistema Altabrisa...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Fixed Sidebar (Desktop) / Slide Drawer (Mobile) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Wrapper shifted on Desktop */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen w-full">
        {/* Sticky Top Navbar */}
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Full-width Main Viewport */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/torres"
            element={
              <ProtectedLayout>
                <TowersPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/apartamentos"
            element={
              <ProtectedLayout>
                <ApartmentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/apartamentos/:id"
            element={
              <ProtectedLayout>
                <ApartmentDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedLayout>
                <ClientsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/contratos"
            element={
              <ProtectedLayout>
                <ContractsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/pagos"
            element={
              <ProtectedLayout>
                <PaymentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/auditoria-solicitudes"
            element={
              <ProtectedLayout>
                <AuditRequestsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/portal-cliente"
            element={
              <ProtectedLayout>
                <ClientPortalPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/mis-pagos"
            element={
              <ProtectedLayout>
                <ClientPortalPage />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
