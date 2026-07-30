import React from 'react';
import Navbar from "../components/layout/Navbar";
import VehicleCard from "../components/vehicle/VehicleCard";

const placeholderVehicles = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry",
    year: 2023,
    price: 3250000,
    mileage: 12000,
    transmission: "Automatic",
    fuelType: "Petrol",
    bodyType: "Sedan",
    color: "White",
    quantity: 5,
    image: null,
  },
  {
    id: 2,
    make: "Hyundai",
    model: "Creta",
    year: 2024,
    price: 1890000,
    mileage: 8000,
    transmission: "Manual",
    fuelType: "Diesel",
    bodyType: "SUV",
    color: "Black",
    quantity: 2,
    image: null,
  },
  {
    id: 3,
    make: "Honda",
    model: "City",
    year: 2022,
    price: 1450000,
    mileage: 22000,
    transmission: "Automatic",
    fuelType: "Petrol",
    bodyType: "Sedan",
    color: "Silver",
    quantity: 0,
    image: null,
  },
];

const Home = () => {
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
        
        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-full md:w-1/2 lg:w-1/3">
            {/* FUTURE: <SearchBar /> */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search vehicles by make, model, or VIN..." 
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Total Vehicles: [Count]</span>
            <select className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none">
              <option>Sort by: Newest Added</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Stock (Low to High)</option>
            </select>
          </div>
        </div>

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
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {placeholderVehicles.map((vehicle) => (
      <VehicleCard
        key={vehicle.id}
        vehicle={vehicle}
      />
    ))}
  </div>
</div>
        </div>
      </main>
    </div>
  );
};

export default Home;