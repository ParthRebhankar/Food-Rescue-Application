import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRole = null }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Verifying security session...</p>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role requirement is specified, verify DB role
  if (allowedRole && role !== allowedRole) {
    // Redirect based on actual role
    if (role === 'merchant') {
      return <Navigate to="/merchant" replace />;
    } else {
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
}
