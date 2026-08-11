import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const ProtectedRoute: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Authenticating user session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const RoleGuard: React.FC<{ allowedRoles: Role[] }> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
