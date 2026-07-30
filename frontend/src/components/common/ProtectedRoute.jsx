/**
 * ProtectedRoute.jsx
 *
 * Wraps any route that requires authentication.
 * If no token exists in localStorage the user is redirected to /login.
 * Once AuthContext is in place this will read from context instead.
 */

import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
