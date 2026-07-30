/**
 * Login.jsx
 *
 * Public page — /login
 *
 * - Calls useAuth().login(username, password)
 * - Shows inline field validation before submitting
 * - Shows server error messages (wrong credentials, network, etc.)
 * - Shows a loading spinner on the button while the request is in-flight
 * - Redirects to / on success
 * - Redirects to / immediately if already authenticated
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — skip straight to dashboard
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  function validate() {
    const next = {};
    if (!form.username.trim()) next.username = 'Username is required.';
    if (!form.password)        next.password = 'Password is required.';
    return next;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      await login(form.username.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* ── Card ── */}
        <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-lg">
              AV
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to AutoVault</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
                  errors.username
                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
                  errors.password
                    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
