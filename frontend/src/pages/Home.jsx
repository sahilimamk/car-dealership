import { useMemo, useState } from 'react';
import Navbar from "../components/Navbar";
import VehicleCard from "../components/VehicleCard";
import SearchBar from "../components/SearchBar";
import { sampleVehicles } from "../data/sampleVehicles";


const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    min: "",
    max: "",
  });

  const filteredVehicles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sampleVehicles.filter((vehicle) => {
      const matchesQuery =
        !query ||
        [vehicle.make, vehicle.model, vehicle.year, vehicle.bodyType]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        !filters.category || vehicle.bodyType === filters.category;

      const price = Number(vehicle.price);
      const minPrice = filters.min === "" ? null : Number(filters.min);
      const maxPrice = filters.max === "" ? null : Number(filters.max);

      const matchesMin = minPrice === null || price >= minPrice;
      const matchesMax = maxPrice === null || price <= maxPrice;

      return matchesQuery && matchesCategory && matchesMin && matchesMax;
    });
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Navbar Placeholder */}
      <Navbar />

      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 pt-20 pb-6 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage vehicle stock, track availability, and process purchases.</p>
            </div>
            
            {/* Admin Action Placeholder */}
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2">
                <span>+</span> Add New Vehicle
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Inventory Section */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
<SearchBar
          totalVehicles={sampleVehicles.length}
          onSearch={setSearchQuery}
          onFilter={setFilters}
        />
           
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Clear All</button>
              </div>
              
              {/* FUTURE: <Filter /> components */}
              <div className="space-y-5">
                {['Make & Model', 'Year', 'Price Range', 'Stock Status', 'Fuel Type', 'Transmission'].map((filterName, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">{filterName}</h4>
                    <select className="w-full bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-md p-2 outline-none focus:border-blue-500">
                      <option>All</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </aside>

{/* Vehicle Grid */}
<div className="w-full lg:w-3/4 xl:w-4/5">
  <div className="mb-4 text-sm text-gray-600">
    Showing <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> of{' '}
    <span className="font-semibold text-gray-900">{sampleVehicles.length}</span> vehicles
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {filteredVehicles.map((vehicle) => (
      <VehicleCard
        key={vehicle.id}
        vehicle={vehicle}
      />
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