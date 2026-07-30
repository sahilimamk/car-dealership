import { useMemo, useState } from 'react';
import Navbar from "../components/Navbar";
import VehicleCard from "../components/VehicleCard";
import FilterSidebar from "../components/FilterSidebar";
import { sampleVehicles } from "../data/sampleVehicles";


const initialFilters = {
  searchQuery: "",
  minPrice: "",
  maxPrice: "",
  brands: [],
  year: "",
  fuelTypes: [],
  transmission: "",
};

const Home = () => {
  const [filters, setFilters] = useState(initialFilters);

  const filteredVehicles = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();
    const selectedYear = filters.year ? Number(filters.year) : null;

    return sampleVehicles.filter((vehicle) => {
      const searchText = [vehicle.make, vehicle.model, vehicle.year, vehicle.bodyType]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || searchText.includes(query);
      const matchesBrands = filters.brands.length === 0 || filters.brands.includes(vehicle.make);
      const matchesYear = selectedYear === null || vehicle.year >= selectedYear;
      const matchesFuel = filters.fuelTypes.length === 0 || filters.fuelTypes.includes(vehicle.fuelType);
      const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission;

      const price = Number(vehicle.price);
      const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
      const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
      const matchesMin = minPrice === null || price >= minPrice;
      const matchesMax = maxPrice === null || price <= maxPrice;

      return (
        matchesQuery &&
        matchesBrands &&
        matchesYear &&
        matchesFuel &&
        matchesTransmission &&
        matchesMin &&
        matchesMax
      );
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Navbar />

      <header className="bg-white border-b border-gray-200 pt-20 pb-6 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage vehicle stock, track availability, and process purchases.</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2">
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
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{sampleVehicles.length}</span> vehicles
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                No vehicles match your search.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;