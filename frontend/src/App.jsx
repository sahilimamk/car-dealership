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
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Catch-all → dashboard ─────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
