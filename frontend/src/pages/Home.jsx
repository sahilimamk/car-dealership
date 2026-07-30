/**
 * Home.jsx — Inventory Dashboard
 *
 * Fetches vehicles from the backend using GET /api/vehicles/search.
 * The query re-runs whenever filters change (debounced 300 ms).
 * Fields supported by the backend (make, model, category, minPrice,
 * maxPrice) are sent as query params. Fields not supported by the
 * backend (fuelType, transmission, year, brands) are filtered
 * client-side from the results.
 * Sorting is applied client-side on the filtered list.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import FilterSidebar from '../components/FilterSidebar';
import VehicleFormModal from '../components/admin/VehicleFormModal';
import { searchVehicles } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';

// ── Constants ────────────────────────────────────────────────────────────────

const initialFilters = {
  searchQuery: '',
  minPrice: '',
  maxPrice: '',
  brands: [],
  category: '',
  year: '',
  fuelTypes: [],
  transmission: '',
};

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'quantity',   label: 'Quantity' },
];

const DEBOUNCE_MS = 300;

// ── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filters, setFilters]   = useState(initialFilters);
  const [sortBy, setSortBy]     = useState('newest');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Debounce timer ref
  const debounceRef = useRef(null);

  // ── Fetch — called on every filter change (debounced) ────────────────────
  const fetchResults = useCallback((activeFilters) => {
    // Build backend-supported query params
    const params = {};

    // searchQuery is sent as `make` to the backend for a broad name search.
    // Client-side pass below also matches model + year from returned results.
    if (activeFilters.searchQuery.trim()) {
      params.make = activeFilters.searchQuery.trim();
    }

    // Category — sent directly to backend when selected
    if (activeFilters.category) {
      params.category = activeFilters.category;
    }

    // Price range goes straight to the backend.
    if (activeFilters.minPrice !== '') params.minPrice = activeFilters.minPrice;
    if (activeFilters.maxPrice !== '') params.maxPrice = activeFilters.maxPrice;

    let cancelled = false;

    setLoading(true);
    setError('');

    searchVehicles(params)
      .then((data) => {
        if (!cancelled) setVehicles(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load vehicles. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Debounce filter changes before hitting the API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(filters);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchResults]);

  function handleVehicleAdded(newVehicle) {
    setVehicles((prev) => [newVehicle, ...prev]);
  }

  function handleVehicleUpdated(updatedVehicle) {
    setVehicles((prev) => prev.map((vehicle) => (vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle)));
  }

  function handleVehiclePurchased(updatedVehicle) {
    setVehicles((prev) => prev.map((vehicle) => (vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle)));
  }

  function handleVehicleDeleted(vehicleId) {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingVehicle(null);
  }

  // ── Client-side refinement for fields the backend doesn't filter ─────────
  const filteredVehicles = useMemo(() => {
    const query        = filters.searchQuery.trim().toLowerCase();
    const selectedYear = filters.year ? Number(filters.year) : null;

    return vehicles.filter((vehicle) => {
      // Broaden search to include model and year (backend only matched make)
      if (query) {
        const text = `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      if (filters.brands.length > 0 && !filters.brands.includes(vehicle.make)) return false;
      if (selectedYear !== null && vehicle.year < selectedYear) return false;
      if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuelType)) return false;
      if (filters.transmission && vehicle.transmission !== filters.transmission) return false;

      return true;
    });
  }, [vehicles, filters]);

  // ── Sorting ───────────────────────────────────────────────────────────────
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    switch (sortBy) {
      case 'price_asc':  return list.sort((a, b) => a.price - b.price);
      case 'price_desc': return list.sort((a, b) => b.price - a.price);
      case 'quantity':   return list.sort((a, b) => b.quantity - a.quantity);
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filteredVehicles, sortBy]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Navbar />

      <header className="bg-white border-b border-gray-200 pt-20 pb-6 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Manage vehicle stock, track availability, and process purchases.
              </p>
            </div>

            {/* Add Vehicle button — admin only */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add New Vehicle
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFilterChange={setFilters} />

          <div className="w-full lg:flex-1">

            {/* ── Toolbar: count + sort ── */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-600">
                {loading
                  ? 'Loading…'
                  : error
                  ? ''
                  : <>
                      Showing{' '}
                      <span className="font-semibold text-gray-900">{sortedVehicles.length}</span>
                      {' '}vehicle{sortedVehicles.length !== 1 ? 's' : ''}
                    </>
                }
              </p>

              {/* Sort control — always visible */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Loading state ── */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
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
                <span className="ml-3 text-gray-500 text-sm">Loading vehicles…</span>
              </div>
            )}

            {/* ── Error state ── */}
            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={() => setFilters({ ...initialFilters })}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Reset filters &amp; retry
                </button>
              </div>
            )}

            {/* ── Results ── */}
            {!loading && !error && (
              sortedVehicles.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                  <p className="text-lg font-medium">No vehicles found</p>
                  <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onPurchase={handleVehiclePurchased}
                      onEdit={(nextVehicle) => setEditingVehicle(nextVehicle)}
                      onDelete={handleVehicleDeleted}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* ── Vehicle modal (admin only) ── */}
      {isAdmin && (
        <VehicleFormModal
          key={showAddModal ? 'add-open' : editingVehicle?.id || 'edit-closed'}
          isOpen={showAddModal || Boolean(editingVehicle)}
          vehicle={editingVehicle}
          onClose={closeModal}
          onSuccess={(savedVehicle) => {
            if (editingVehicle) {
              handleVehicleUpdated(savedVehicle);
            } else {
              handleVehicleAdded(savedVehicle);
            }
            closeModal();
          }}
        />
      )}
    </div>
  );
}
