/**
 * api/vehicles.js
 *
 * All vehicle-related API calls.
 *
 * Strategy:
 *  - All requests go to the real backend first.
 *  - READ operations (list / search) fall back to localStorage-backed
 *    sample data only when the backend is unreachable.
 *  - WRITE operations (create, update, delete, purchase, restock) always
 *    go to the backend. If the backend is down they operate on the local
 *    in-memory store (localStorage) so the UI stays usable.
 *  - IDs are kept consistent: when showing fallback data, we use the
 *    same IDs that the local store knows about.
 */

import { sampleVehicles } from '../data/sampleVehicles';

// ── Base URL ──────────────────────────────────────────────────────────────────

function getApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) return '/api';
  return 'https://car-dealership-4ff1.onrender.com/api';
}

// ── Auth headers ──────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Local (offline) store ─────────────────────────────────────────────────────

const STORAGE_KEY = 'demo-vehicles';

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `vehicle-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function normalizeVehicle(v, fallbackIndex = 0) {
  return {
    id: v?.id ?? v?._id ?? `demo-${fallbackIndex + 1}`,
    make: v?.make || 'Unknown',
    model: v?.model || 'Unknown',
    category: v?.category || 'Sedan',
    year: Number(v?.year ?? new Date().getFullYear()),
    price: Number(v?.price ?? 0),
    quantity: Number(v?.quantity ?? 0),
    imageUrl: v?.imageUrl ?? v?.image ?? null,
    description: v?.description ?? null,
    transmission: v?.transmission ?? null,
    fuelType: v?.fuelType ?? null,
    mileage: Number(v?.mileage ?? 0),
    bodyType: v?.bodyType ?? null,
    color: v?.color ?? null,
    createdAt: v?.createdAt ?? new Date().toISOString(),
    updatedAt: v?.updatedAt ?? new Date().toISOString(),
  };
}

/** Normalize a raw backend vehicle so the shape matches what the UI expects. */
function normalizeBackendVehicle(v) {
  return {
    id: v?._id ?? v?.id,
    make: v?.make,
    model: v?.model,
    category: v?.category,
    year: v?.year,
    price: v?.price,
    quantity: v?.quantity,
    imageUrl: v?.imageUrl ?? null,
    description: v?.description ?? null,
    transmission: v?.transmission ?? null,
    fuelType: v?.fuelType ?? null,
    mileage: v?.mileage ?? 0,
    bodyType: v?.bodyType ?? null,
    color: v?.color ?? null,
    createdAt: v?.createdAt ?? new Date().toISOString(),
    updatedAt: v?.updatedAt ?? new Date().toISOString(),
  };
}

function readLocalVehicles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((v, i) => normalizeVehicle(v, i));
      }
    }
  } catch {
    // ignore
  }
  const seeded = sampleVehicles.map((v, i) => normalizeVehicle(v, i));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeLocalVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  return vehicles;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Makes a JSON request to the backend.
 * Throws on non-2xx responses (with the parsed error body attached).
 * Throws on network errors too.
 */
async function apiFetch(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  let body;
  const ct = response.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const err = new Error(
      (typeof body === 'object' ? body?.error : body) ?? `HTTP ${response.status}`
    );
    err.status = response.status;
    err.data = body;
    throw err;
  }

  return body;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch in-stock vehicles.
 * Falls back to local store if backend is unreachable.
 */
export async function fetchVehicles() {
  try {
    const data = await apiFetch('/vehicles');
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeBackendVehicle);
  } catch {
    return readLocalVehicles().filter((v) => v.quantity > 0);
  }
}

/**
 * Search/filter vehicles.
 * Falls back to local store if backend is unreachable.
 */
export async function searchVehicles(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const path = `/vehicles/search${query.toString() ? `?${query}` : ''}`;

  try {
    const data = await apiFetch(path);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeBackendVehicle);
  } catch {
    // Offline — apply filters to local store
    const locals = readLocalVehicles();
    const make = params.make ?? '';
    const category = params.category ?? '';
    const minPrice = params.minPrice != null ? Number(params.minPrice) : null;
    const maxPrice = params.maxPrice != null ? Number(params.maxPrice) : null;
    return locals.filter((v) => {
      if (make && !v.make.toLowerCase().includes(make.toLowerCase())) return false;
      if (category && v.category.toLowerCase() !== category.toLowerCase()) return false;
      if (minPrice != null && v.price < minPrice) return false;
      if (maxPrice != null && v.price > maxPrice) return false;
      return true;
    });
  }
}

/**
 * Create a vehicle.
 * Tries backend first; falls back to local store.
 */
export async function createVehicle(payload) {
  try {
    const data = await apiFetch('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeBackendVehicle(data);
  } catch (err) {
    // If it's a real validation error (422), re-throw so the form shows it
    if (err.status === 422 || err.status === 400) throw err;
    // Network/server down — save locally
    const vehicles = readLocalVehicles();
    const newVehicle = normalizeVehicle({
      ...payload,
      id: makeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    writeLocalVehicles([newVehicle, ...vehicles]);
    return newVehicle;
  }
}

/**
 * Update a vehicle.
 * Tries backend first; falls back to local store.
 */
export async function updateVehicle(id, payload) {
  try {
    const data = await apiFetch(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeBackendVehicle(data);
  } catch (err) {
    if (err.status === 422 || err.status === 400 || err.status === 404) throw err;
    // Network down — update locally
    const vehicles = readLocalVehicles();
    const updated = vehicles.map((v) =>
      v.id === id ? normalizeVehicle({ ...v, ...payload, id, updatedAt: new Date().toISOString() }) : v
    );
    writeLocalVehicles(updated);
    const found = updated.find((v) => v.id === id);
    if (!found) { const e = new Error('Vehicle not found.'); e.status = 404; throw e; }
    return found;
  }
}

/**
 * Delete a vehicle.
 * Tries backend first; falls back to local store.
 */
export async function deleteVehicle(id) {
  try {
    return await apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
  } catch (err) {
    if (err.status === 404) throw err;
    const vehicles = readLocalVehicles();
    writeLocalVehicles(vehicles.filter((v) => v.id !== id));
    return { message: 'Vehicle deleted successfully.' };
  }
}

/**
 * Purchase a vehicle — decrements quantity by 1.
 * Tries backend first; falls back to local store.
 */
export async function purchaseVehicle(id) {
  try {
    const data = await apiFetch(`/vehicles/${id}/purchase`, { method: 'POST' });
    // backend returns { vehicle: {...} }
    return { vehicle: normalizeBackendVehicle(data.vehicle ?? data) };
  } catch (err) {
    if (err.status === 400 || err.status === 404) throw err;
    // Network down — update locally
    const vehicles = readLocalVehicles();
    const target = vehicles.find((v) => v.id === id);
    if (!target || target.quantity <= 0) {
      const e = new Error('Vehicle not available or out of stock.');
      e.status = 400;
      e.data = { error: 'Vehicle not available or out of stock.' };
      throw e;
    }
    const updated = vehicles.map((v) =>
      v.id === id
        ? normalizeVehicle({ ...v, quantity: v.quantity - 1, updatedAt: new Date().toISOString() })
        : v
    );
    writeLocalVehicles(updated);
    return { vehicle: updated.find((v) => v.id === id) };
  }
}

/**
 * Restock a vehicle.
 * Tries backend first; falls back to local store.
 */
export async function restockVehicle(id, amount) {
  try {
    const data = await apiFetch(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return { vehicle: normalizeBackendVehicle(data.vehicle ?? data) };
  } catch (err) {
    if (err.status === 400 || err.status === 404) throw err;
    const vehicles = readLocalVehicles();
    const updated = vehicles.map((v) =>
      v.id === id
        ? normalizeVehicle({ ...v, quantity: v.quantity + Number(amount), updatedAt: new Date().toISOString() })
        : v
    );
    writeLocalVehicles(updated);
    const found = updated.find((v) => v.id === id);
    if (!found) { const e = new Error('Vehicle not found.'); e.status = 404; throw e; }
    return { vehicle: found };
  }
}
