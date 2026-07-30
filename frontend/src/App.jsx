/**
 * App.jsx
 *
 * Root route configuration.
 *
 * Public routes  — accessible without a token
 *   /login       — Login page  (placeholder until Commit 4)
 *   /register    — Register page (placeholder until Commit 5)
 *
 * Protected routes — require a valid JWT (redirects to /login if absent)
 *   /            — Inventory dashboard (Home)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';

// Lightweight placeholders — replaced by real pages in Commits 4 & 5
function LoginPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Login page coming soon…</p>
    </div>
  );
}

function RegisterPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Register page coming soon…</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────── */}
      <Route path="/login"    element={<LoginPlaceholder />} />
      <Route path="/register" element={<RegisterPlaceholder />} />

      {/* ── Protected routes ──────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ── Catch-all → dashboard (protected) ────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
