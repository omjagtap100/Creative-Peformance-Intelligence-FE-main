import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { UserRole } from '../types/cpi';
import { ShieldAlert } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGate: React.FC<AuthGateProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Initializing CPI Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-display font-bold text-stone-900 mb-2">
          Insufficient Role Privileges
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Your current role (<strong className="capitalize">{role}</strong>) does not have permission to view this section. Allowed roles: {allowedRoles.join(', ')}.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
