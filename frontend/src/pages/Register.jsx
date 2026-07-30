/**
 * Register.jsx
 *
 * Public page — /register
 *
 * - Calls useAuth().register(username, email, password)
 * - Client-side validation: required fields, email format, password length,
 *   password confirmation match
 * - Shows server error messages (duplicate username, etc.)
 * - Shows loading spinner on button while request is in-flight
 * - Redirects to /login on success
 * - Redirects to / immediately if already authenticated
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Field helper — declared at module scope to satisfy the hooks/static-components rule ──

function Field({ id, label, type = 'text', autoComplete, placeholder, value, error, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors]             = useState({});
  const [serverError, setServerError]   = useState('');
  const [loading, setLoading]           = useState(false);

  // Already logged in — skip to dashboard
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  function validate() {
    const next = {};

    if (!form.username.trim()) {
      next.username = 'Username is required.';
    } else if (form.username.trim().length < 3) {
      next.username = 'Username must be at least 3 characters.';
    }

    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      next.password = 'Password is required.';
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }

    return next;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate('/login', { replace: true, state: { registered: true } });
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Card ── */}
        <div className="rounded-2xl bg-white p-8 shadow-md border border-gray-100">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-lg">
              AV
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="mt-1 text-sm text-gray-500">Join AutoVault today</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field
              id="username"
              label="Username"
              autoComplete="username"
              placeholder="Choose a username"
              value={form.username}
              error={errors.username}
              onChange={handleChange}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={form.email}
              error={errors.email}
              onChange={handleChange}
            />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              error={errors.password}
              onChange={handleChange}
            />
            <Field
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
