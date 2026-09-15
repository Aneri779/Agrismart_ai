import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RoleGuard = ({ children, requireRole }) => {
  const { authenticated, role, loading } = useAuth();

  // If AuthContext is still restoring the session from localStorage, we might want to show a spinner.
  // But for now, returning null avoids flashing the login page incorrectly.
  if (loading) {
    return null;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && role !== requireRole) {
    // If an admin tries to access a farmer page, send to admin dashboard
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If a farmer tries to access an admin page, send to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
