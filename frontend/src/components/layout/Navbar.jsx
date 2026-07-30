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

import { Link } from "react-router-dom";

export default function Navbar() {
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

          <Link
            to="/"
            className="font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Home
          </Link>

          <Link
            to="/inventory"
            className="font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Inventory
          </Link>

          <Link
            to="/about"
            className="font-medium text-gray-700 hover:text-blue-600 transition"
          >
            About
          </Link>

          <Link
            to="/contact"
            className="font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Contact
          </Link>

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

        </div>

      </div>
    </nav>
  );
}