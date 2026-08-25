import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { AuthGate } from './AuthGate';
import { Layout } from './Layout';
import { LoginPage } from '../features/auth/LoginPage';
import { CreativesListPage } from '../features/creatives/CreativesListPage';
import { CreativeDetailPage } from '../features/creatives/CreativeDetailPage';
import { RecommendationsPage } from '../features/recommendations/RecommendationsPage';
import { GenerationsPage } from '../features/generations/GenerationsPage';
import { CrmLeadsPage } from '../features/crm/CrmLeadsPage';
import { BrandKitPage } from '../features/brand/BrandKitPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/creatives' : '/login'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Workspace Shell */}
          <Route
            element={
              <AuthGate>
                <Layout />
              </AuthGate>
            }
          >
            <Route path="/creatives" element={<CreativesListPage />} />
            <Route path="/creatives/:creativeId" element={<CreativeDetailPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/generations" element={<GenerationsPage />} />
            <Route path="/crm" element={<CrmLeadsPage />} />
            <Route path="/brand" element={<BrandKitPage />} />
          </Route>

          {/* Root & Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
