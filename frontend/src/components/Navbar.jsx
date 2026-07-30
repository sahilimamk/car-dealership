// ============================================================
// Navbar.jsx
// Top Navigation Bar
// ============================================================
//
// PURPOSE
// ------------------------------------------------------------
// Main navigation component for the Car Dealership application.
//
// CURRENT FEATURES
// ------------------------------------------------------------
// • Company Logo
// • Navigation Links
// • Search Input
// • Login/Register Buttons
//
// FUTURE FEATURES
// ------------------------------------------------------------
// • Authentication Context
// • User Profile Dropdown
// • Admin Panel Link
// • Logout
// • Mobile Navigation
// • Wishlist
// • Notifications
//
// ============================================================

import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* ================= Logo ================= */}

        <Link
          to="/"
          className="flex items-center gap-3 text-decoration-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            AV
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-800">
              AutoVault
            </h1>

            <p className="text-xs text-gray-500">
              Premium Dealership
            </p>
          </div>
        </Link>

        {/* ============== Navigation Links ============== */}

        <div className="hidden gap-8 md:flex">

          <NavLink
            to="/"
            className={({ isActive }) => `font-medium transition ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) => `font-medium transition ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
          >
            Inventory
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `font-medium transition ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `font-medium transition ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
          >
            Contact
          </NavLink>

        </div>

        {/* ================= Search ================= */}

        <div className="hidden lg:block">

          <input
            type="text"
            placeholder="Search vehicles..."
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />

        </div>

        {/* ============== Authentication ============== */}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600">
                Hi, <span className="font-semibold text-gray-900">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}