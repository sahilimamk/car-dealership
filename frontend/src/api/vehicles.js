/**
 * api/vehicles.js
 *
 * All vehicle-related API calls.
 * Each function returns the response data directly and lets
 * the caller handle errors.
 */

import api from './axios';

/** Fetch all vehicles (quantity > 0 filtered on the backend) */
export async function fetchVehicles() {
  const { data } = await api.get('/vehicles');
  return data;
}

/** Search / filter vehicles by query params */
export async function searchVehicles(params) {
  const { data } = await api.get('/vehicles/search', { params });
  return data;
}

/** Create a new vehicle (admin only) */
export async function createVehicle(payload) {
  const { data } = await api.post('/vehicles', payload);
  return data;
}

/** Update an existing vehicle */
export async function updateVehicle(id, payload) {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data;
}

/** Delete a vehicle (admin only) */
export async function deleteVehicle(id) {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
}

/** Purchase a vehicle — decrements quantity by 1 */
export async function purchaseVehicle(id) {
  const { data } = await api.post(`/vehicles/${id}/purchase`);
  return data;
}

/** Restock a vehicle (admin only) */
export async function restockVehicle(id, amount) {
  const { data } = await api.post(`/vehicles/${id}/restock`, { amount });
  return data;
}
