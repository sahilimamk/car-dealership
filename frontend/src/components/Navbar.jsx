import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ searchValue = '', onSearchChange }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Only show the search bar on pages that have the inventory grid
  const showSearch = location.pathname === '/' || location.pathname === '/inventory';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
            AV
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-bold text-gray-900 leading-none">AutoVault</p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">Premium Dealership</p>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { to: '/',          label: 'Home' },
            { to: '/inventory', label: 'Inventory' },
            { to: '/about',     label: 'About' },
            { to: '/contact',   label: 'Contact' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Search bar (inventory pages only) ── */}
        {showSearch && onSearchChange && (
          <div className="hidden lg:flex flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search make, model, year…"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Auth ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                Hi, <span className="font-semibold text-gray-900">{user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
