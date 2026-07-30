/**
 * Home.jsx — Inventory Dashboard
 *
 * Fetches vehicles from GET /api/vehicles on mount.
 * Handles loading, error, and empty states.
 * Local filtering via FilterSidebar still works client-side
 * against the fetched list (search + filter integration in commits 7-8).
 */

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import FilterSidebar from '../components/FilterSidebar';
import { fetchVehicles } from '../api/vehicles';

const initialFilters = {
  searchQuery: '',
  minPrice: '',
  maxPrice: '',
  brands: [],
  year: '',
  fuelTypes: [],
  transmission: '',
};

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filters, setFilters]   = useState(initialFilters);

  // ── Fetch vehicles on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchVehicles();
        if (!cancelled) setVehicles(data);
      } catch {
        if (!cancelled) setError('Failed to load vehicles. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    const query       = filters.searchQuery.trim().toLowerCase();
    const selectedYear = filters.year ? Number(filters.year) : null;

    return vehicles.filter((vehicle) => {
      const searchText = [vehicle.make, vehicle.model, vehicle.year, vehicle.bodyType]
        .join(' ')
        .toLowerCase();

      const matchesQuery        = !query || searchText.includes(query);
      const matchesBrands       = filters.brands.length === 0 || filters.brands.includes(vehicle.make);
      const matchesYear         = selectedYear === null || vehicle.year >= selectedYear;
      const matchesFuel         = filters.fuelTypes.length === 0 || filters.fuelTypes.includes(vehicle.fuelType);
      const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;

      const price    = Number(vehicle.price);
      const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
      const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
      const matchesMin = minPrice === null || price >= minPrice;
      const matchesMax = maxPrice === null || price <= maxPrice;

      return matchesQuery && matchesBrands && matchesYear && matchesFuel &&
             matchesTransmission && matchesMin && matchesMax;
    });
  }, [vehicles, filters]);

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

            {/* Add Vehicle button — admin controls wired in commit 10 */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <span>+</span> Add New Vehicle
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFilterChange={setFilters} />

          <div className="w-full lg:flex-1">

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
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Content ── */}
            {!loading && !error && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing{' '}
                  <span className="font-semibold text-gray-900">{filteredVehicles.length}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-900">{vehicles.length}</span>{' '}
                  vehicles
                </div>

                {/* ── Empty state ── */}
                {filteredVehicles.length === 0 ? (
                  <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p className="mt-1 text-sm">
                      {vehicles.length === 0
                        ? 'The inventory is currently empty.'
                        : 'Try adjusting your filters.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
