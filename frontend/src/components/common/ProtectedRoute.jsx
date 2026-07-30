/**
 * ProtectedRoute.jsx
 *
 * Redirects unauthenticated users to /login.
 * Reads auth state from AuthContext.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
