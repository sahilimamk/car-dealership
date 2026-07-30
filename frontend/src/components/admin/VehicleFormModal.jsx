/**
 * VehicleFormModal.jsx
 *
 * Shared modal for both Add and Edit vehicle workflows.
 *
 * Props:
 *   isOpen    — controls visibility
 *   onClose   — called on cancel / backdrop click
 *   onSuccess — called with the saved vehicle after a successful request
 *   vehicle   — if provided, modal runs in Edit mode (pre-populated)
 *
 * Pattern: the parent passes a `key` that changes when the modal opens
 * or the target vehicle changes, so React remounts it fresh each time —
 * no useEffect-based state reset needed.
 */

import { useState } from 'react';
import { createVehicle, updateVehicle } from '../../api/vehicles';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES    = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Truck'];
const FUEL_TYPES    = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Automatic', 'Manual'];

// ── Validation ────────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.make.trim())    errors.make     = 'Make is required.';
  if (!form.model.trim())   errors.model    = 'Model is required.';
  if (!form.category)       errors.category = 'Category is required.';

  const year = Number(form.year);
  if (!form.year || isNaN(year) || year < 1900 || year > 2030)
    errors.year = 'Enter a valid year (1900–2030).';

  const price = Number(form.price);
  if (!form.price || isNaN(price) || price <= 0)
    errors.price = 'Enter a valid positive price.';

  const qty = Number(form.quantity);
  if (form.quantity === '' || isNaN(qty) || qty < 0 || !Number.isInteger(qty))
    errors.quantity = 'Quantity must be a non-negative integer.';

  return errors;
}

// ── FormField — module-scope to satisfy react-hooks/static-components ────────

function FormField({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function VehicleFormModal({ isOpen, onClose, onSuccess, vehicle }) {
  const isEdit = Boolean(vehicle);

  // Initialise from vehicle prop so no effect-based reset is needed.
  // The parent should change the `key` prop whenever isOpen toggles or
  // the target vehicle changes, causing a clean remount.
  const [form, setForm]       = useState(() => vehicle
    ? {
        make:         vehicle.make         ?? '',
        model:        vehicle.model        ?? '',
        category:     vehicle.category     ?? '',
        year:         String(vehicle.year  ?? ''),
        price:        String(vehicle.price ?? ''),
        quantity:     String(vehicle.quantity ?? ''),
        transmission: vehicle.transmission ?? '',
        fuelType:     vehicle.fuelType     ?? '',
        mileage:      String(vehicle.mileage ?? ''),
        bodyType:     vehicle.bodyType     ?? '',
        color:        vehicle.color        ?? '',
        imageUrl:     vehicle.imageUrl     ?? '',
        description:  vehicle.description  ?? '',
      }
    : {
        make: '', model: '', category: '', year: '', price: '',
        quantity: '', transmission: '', fuelType: '', mileage: '',
        bodyType: '', color: '', imageUrl: '', description: '',
      }
  );

  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);

  if (!isOpen) return null;

  function inputCls(field) {
    return `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
      errors[field]
        ? 'border-red-400 bg-red-50 focus:ring-red-200'
        : 'border-gray-300 focus:border-blue-500'
    }`;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    const payload = {
      make:         form.make.trim(),
      model:        form.model.trim(),
      category:     form.category,
      year:         Number(form.year),
      price:        Number(form.price),
      quantity:     Number(form.quantity),
      transmission: form.transmission  || null,
      fuelType:     form.fuelType      || null,
      mileage:      form.mileage !== '' ? Number(form.mileage) : null,
      bodyType:     form.bodyType.trim()    || null,
      color:        form.color.trim()       || null,
      imageUrl:     form.imageUrl.trim()    || null,
      description:  form.description.trim() || null,
    };

    try {
      const saved = isEdit
        ? await updateVehicle(vehicle.id, payload)
        : await createVehicle(payload);
      onSuccess(saved);
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="make" label="Make" required error={errors.make}>
              <input id="make" name="make" value={form.make} onChange={handleChange}
                placeholder="e.g. Toyota" className={inputCls('make')} />
            </FormField>
            <FormField id="model" label="Model" required error={errors.model}>
              <input id="model" name="model" value={form.model} onChange={handleChange}
                placeholder="e.g. Camry" className={inputCls('model')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="category" label="Category" required error={errors.category}>
              <select id="category" name="category" value={form.category}
                onChange={handleChange} className={inputCls('category')}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField id="bodyType" label="Body Type" error={errors.bodyType}>
              <input id="bodyType" name="bodyType" value={form.bodyType} onChange={handleChange}
                placeholder="e.g. Sedan" className={inputCls('bodyType')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField id="year" label="Year" required error={errors.year}>
              <input id="year" name="year" type="number" value={form.year}
                onChange={handleChange} placeholder="2024" className={inputCls('year')} />
            </FormField>
            <FormField id="price" label="Price ($)" required error={errors.price}>
              <input id="price" name="price" type="number" value={form.price}
                onChange={handleChange} placeholder="29999" className={inputCls('price')} />
            </FormField>
            <FormField id="quantity" label="Quantity" required error={errors.quantity}>
              <input id="quantity" name="quantity" type="number" value={form.quantity}
                onChange={handleChange} placeholder="5" className={inputCls('quantity')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="transmission" label="Transmission" error={errors.transmission}>
              <select id="transmission" name="transmission" value={form.transmission}
                onChange={handleChange} className={inputCls('transmission')}>
                <option value="">Select…</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField id="fuelType" label="Fuel Type" error={errors.fuelType}>
              <select id="fuelType" name="fuelType" value={form.fuelType}
                onChange={handleChange} className={inputCls('fuelType')}>
                <option value="">Select…</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="mileage" label="Mileage" error={errors.mileage}>
              <input id="mileage" name="mileage" type="number" value={form.mileage}
                onChange={handleChange} placeholder="0" className={inputCls('mileage')} />
            </FormField>
            <FormField id="color" label="Color" error={errors.color}>
              <input id="color" name="color" value={form.color} onChange={handleChange}
                placeholder="e.g. Pearl White" className={inputCls('color')} />
            </FormField>
          </div>

          <FormField id="imageUrl" label="Image URL" error={errors.imageUrl}>
            <input id="imageUrl" name="imageUrl" value={form.imageUrl} onChange={handleChange}
              placeholder="https://…" className={inputCls('imageUrl')} />
          </FormField>

          <FormField id="description" label="Description" error={errors.description}>
            <textarea id="description" name="description" value={form.description}
              onChange={handleChange} rows={3}
              placeholder="Short description…" className={inputCls('description')} />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
