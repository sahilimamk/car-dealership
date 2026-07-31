/**
 * Home.jsx — Inventory Dashboard
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import VehicleCard from '../components/VehicleCard';
import FilterSidebar from '../components/FilterSidebar';
import VehicleFormModal from '../components/admin/VehicleFormModal';
import { searchVehicles, fetchVehicles } from '../api/vehicles';
import { sampleVehicles } from '../data/sampleVehicles';
import { useAuth } from '../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────

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
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'quantity',   label: 'Quantity' },
];

const DEBOUNCE_MS = 300;

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 flex-1 min-w-0`}>
      <div className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAdmin } = useAuth();

  // All vehicles from the backend (unfiltered, used for stats)
  const [allVehicles, setAllVehicles] = useState([]);

  // Vehicles shown after search/filter (from API)
  const [vehicles, setVehicles] = useState([]);

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filters,  setFilters]  = useState(initialFilters);
  const [sortBy,   setSortBy]   = useState('newest');
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [editingVehicle,  setEditingVehicle]  = useState(null);

  // Track purchases for "vehicles sold" counter (session only)
  const [soldCount, setSoldCount] = useState(0);

  const debounceRef = useRef(null);

  // ── Load ALL vehicles once for stats ──────────────────────────────────────
  useEffect(() => {
    fetchVehicles()
      .then((data) => setAllVehicles(Array.isArray(data) ? data : []))
      .catch(() => setAllVehicles(sampleVehicles));
  }, []);

  // ── Stats derived from allVehicles ────────────────────────────────────────
  const stats = useMemo(() => {
    const src = allVehicles.length > 0 ? allVehicles : [];
    const totalVehicles  = src.length;
    const totalStock     = src.reduce((s, v) => s + (v.quantity ?? 0), 0);
    const totalRevenue   = src.reduce((s, v) => s + (v.price ?? 0) * (v.quantity ?? 0), 0);
    const categories     = new Set(src.map((v) => v.category).filter(Boolean)).size;
    return { totalVehicles, totalStock, totalRevenue, categories };
  }, [allVehicles]);

  // ── Fetch filtered results ─────────────────────────────────────────────────
  const fetchResults = useCallback((activeFilters) => {
    const params = {};
    if (activeFilters.searchQuery.trim()) params.make = activeFilters.searchQuery.trim();
    if (activeFilters.category)           params.category = activeFilters.category;
    if (activeFilters.minPrice !== '')    params.minPrice = activeFilters.minPrice;
    if (activeFilters.maxPrice !== '')    params.maxPrice = activeFilters.maxPrice;

    let cancelled = false;
    setLoading(true);
    setError('');

    searchVehicles(params)
      .then((data) => {
        if (!cancelled) {
          const normalized = Array.isArray(data) ? data : [];
          setVehicles(normalized.length > 0 ? normalized : sampleVehicles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not reach the server. Showing sample inventory.');
          setVehicles(sampleVehicles);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Debounce filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(filters), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchResults]);

  // ── Navbar search handler — updates filter state ──────────────────────────
  function handleNavbarSearch(value) {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  }

  // ── Vehicle event handlers ────────────────────────────────────────────────
  function handleVehicleAdded(v)     { setVehicles((p) => [v, ...p]); setAllVehicles((p) => [v, ...p]); }
  function handleVehicleUpdated(v)   { setVehicles((p) => p.map((x) => x.id === v.id ? v : x)); setAllVehicles((p) => p.map((x) => x.id === v.id ? v : x)); }
  function handleVehiclePurchased(v) { setVehicles((p) => p.map((x) => x.id === v.id ? v : x)); setAllVehicles((p) => p.map((x) => x.id === v.id ? v : x)); setSoldCount((n) => n + 1); }
  function handleVehicleDeleted(id)  { setVehicles((p) => p.filter((x) => x.id !== id)); setAllVehicles((p) => p.filter((x) => x.id !== id)); }
  function closeModal()              { setShowAddModal(false); setEditingVehicle(null); }

  // ── Client-side filter refinement ─────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    const query       = filters.searchQuery.trim().toLowerCase();
    const selectedYear = filters.year ? Number(filters.year) : null;
    return vehicles.filter((v) => {
      if (query) {
        const text = `${v.make} ${v.model} ${v.year}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (filters.brands.length > 0 && !filters.brands.includes(v.make))          return false;
      if (selectedYear !== null && v.year < selectedYear)                          return false;
      if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(v.fuelType)) return false;
      if (filters.transmission && v.transmission !== filters.transmission)          return false;
      return true;
    });
  }, [vehicles, filters]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    switch (sortBy) {
      case 'price_asc':  return list.sort((a, b) => a.price - b.price);
      case 'price_desc': return list.sort((a, b) => b.price - a.price);
      case 'quantity':   return list.sort((a, b) => b.quantity - a.quantity);
      default:           return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filteredVehicles, sortBy]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">

      {/* Pass search state up to Navbar */}
      <Navbar searchValue={searchInput} onSearchChange={handleNavbarSearch} />

      {/* ── Inventory Overview Stats Banner ── */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight">Inventory Overview</h2>
            <p className="text-blue-200 text-sm mt-0.5">Live snapshot of your dealership stock</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              color="bg-blue-100 text-blue-700"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h10l1-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 6l1.5-2h4l1.5 3v9h-3" />
                </svg>
              }
              label="Total Listings"
              value={stats.totalVehicles}
              sub={`${stats.totalStock} units in stock`}
            />
            <StatCard
              color="bg-emerald-100 text-emerald-700"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Vehicles Sold"
              value={soldCount}
              sub="this session"
            />
            <StatCard
              color="bg-amber-100 text-amber-700"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Total Stock Value"
              value={`$${(stats.totalRevenue / 1_000_000).toFixed(1)}M`}
              sub="across all listings"
            />
            <StatCard
              color="bg-purple-100 text-purple-700"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              }
              label="Categories"
              value={stats.categories}
              sub="vehicle types"
            />
          </div>
        </div>
      </section>

      {/* ── Dashboard header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Manage vehicle stock, track availability, and process purchases.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Vehicle
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFilterChange={setFilters} />

          <div className="w-full lg:flex-1 min-w-0">

            {/* Toolbar */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : error ? '' : (
                  <>Showing <span className="font-semibold text-gray-900">{sortedVehicles.length}</span> vehicle{sortedVehicles.length !== 1 ? 's' : ''}</>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="ml-3 text-gray-500 text-sm">Loading vehicles…</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center mb-6">
                <p className="text-amber-800 font-medium text-sm">{error}</p>
                <button type="button" onClick={() => setFilters({ ...initialFilters })} className="mt-3 text-sm text-blue-600 hover:underline">
                  Reset &amp; retry
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && (
              sortedVehicles.length === 0
                ? (
                  <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center text-gray-400">
                    <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-500">No vehicles found</p>
                    <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sortedVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onPurchase={handleVehiclePurchased}
                        onEdit={(v) => setEditingVehicle(v)}
                        onDelete={handleVehicleDeleted}
                      />
                    ))}
                  </div>
                )
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isAdmin && (
        <VehicleFormModal
          key={showAddModal ? 'add-open' : editingVehicle?.id || 'edit-closed'}
          isOpen={showAddModal || Boolean(editingVehicle)}
          vehicle={editingVehicle}
          onClose={closeModal}
          onSuccess={(saved) => {
            editingVehicle ? handleVehicleUpdated(saved) : handleVehicleAdded(saved);
            closeModal();
          }}
        />
      )}
    </div>
  );
}
