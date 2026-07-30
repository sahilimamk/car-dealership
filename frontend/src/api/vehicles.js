/**
 * api/vehicles.js
 *
 * All vehicle-related API calls.
 * Each function returns the response data directly and lets
 * the caller handle errors.
 */

function getApiBaseUrl() {
  const baseUrl = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestJson(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    throw {
      response: {
        status: response.status,
        data: typeof payload === 'string' ? { error: payload } : payload,
      },
    };
  }

  return payload;
}

/** Fetch all vehicles (quantity > 0 filtered on the backend) */
export async function fetchVehicles() {
  return requestJson('/vehicles');
}

/** Search / filter vehicles by query params */
export async function searchVehicles(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
  const path = `/vehicles/search${query.toString() ? `?${query.toString()}` : ''}`;
  return requestJson(path);
}

/** Create a new vehicle (admin only) */
export async function createVehicle(payload) {
  return requestJson('/vehicles', { method: 'POST', body: JSON.stringify(payload) });
}

/** Update an existing vehicle */
export async function updateVehicle(id, payload) {
  return requestJson(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

/** Delete a vehicle (admin only) */
export async function deleteVehicle(id) {
  return requestJson(`/vehicles/${id}`, { method: 'DELETE' });
}

/** Purchase a vehicle — decrements quantity by 1 */
export async function purchaseVehicle(id) {
  return requestJson(`/vehicles/${id}/purchase`, { method: 'POST' });
}

/** Restock a vehicle (admin only) */
export async function restockVehicle(id, amount) {
  return requestJson(`/vehicles/${id}/restock`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}
