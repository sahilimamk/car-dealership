/**
 * App.jsx
 *
 * Root route configuration.
 *
 * Public routes  — accessible without a token
 *   /login       — Login page
 *   /register    — Register page
 *
 * Protected routes — require a valid JWT (redirects to /login if absent)
 *   /            — Inventory dashboard (Home)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected routes ──────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ── Catch-all → dashboard (protected) ────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
