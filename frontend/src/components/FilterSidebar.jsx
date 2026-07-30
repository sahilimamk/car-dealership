import { useState } from "react";

const BRAND_OPTIONS = [
  "Toyota",
  "Hyundai",
  "Honda",
  "Tata",
  "Mahindra",
  "Kia",
  "Maruti Suzuki",
  "Volkswagen",
  "Skoda",
  "BMW",
];

const YEAR_OPTIONS = [
  { label: "2024 & Above", value: 2024 },
  { label: "2022 & Above", value: 2022 },
  { label: "2020 & Above", value: 2020 },
  { label: "2018 & Above", value: 2018 },
];

const FUEL_OPTIONS = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];

const defaultFilters = {
  searchQuery: "",
  minPrice: "",
  maxPrice: "",
  brands: [],
  year: "",
  fuelTypes: [],
  transmission: "",
};

function FilterSidebar({ onFilterChange } = {}) {
  const [filters, setFilters] = useState(defaultFilters);

  function notifyFilterChange(nextFilters) {
    if (onFilterChange) {
      // TODO: Connect this payload to backend filtering when the API is ready.
      onFilterChange(nextFilters);
    }
  }

  function updateFilters(updater) {
    setFilters((currentFilters) => {
      const nextFilters = typeof updater === "function" ? updater(currentFilters) : updater;
      notifyFilterChange(nextFilters);
      return nextFilters;
    });
  }

  function handleSearchChange(value) {
    updateFilters((currentFilters) => ({
      ...currentFilters,
      searchQuery: value,
    }));
  }

  function handlePriceChange(field, value) {
    updateFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  }

  function handleCheckboxChange(field, value) {
    updateFilters((currentFilters) => {
      const isSelected = currentFilters[field].includes(value);
      const nextValues = isSelected
        ? currentFilters[field].filter((item) => item !== value)
        : [...currentFilters[field], value];

      return {
        ...currentFilters,
        [field]: nextValues,
      };
    });
  }

  function handleRadioChange(field, value) {
    updateFilters((currentFilters) => ({
      ...currentFilters,
      [field]: currentFilters[field] === value ? "" : value,
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
    notifyFilterChange(defaultFilters);
  }

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="sticky top-24 flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="mt-1 text-sm text-gray-500">
            Refine inventory by search, price, brand, year, fuel, and transmission.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Search
              </h3>
              <div className="mt-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Search Vehicles
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search make, model, year..."
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Price Range
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Minimum Price
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(event) => handlePriceChange("minPrice", event.target.value)}
                    placeholder="₹0"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Maximum Price
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(event) => handlePriceChange("maxPrice", event.target.value)}
                    placeholder="₹50,00,000"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Brand
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {BRAND_OPTIONS.map((brand) => {
                  const checkboxId = `brand-${brand.toLowerCase().replace(/\s+/g, "-")}`;

                  return (
                    <label key={brand} htmlFor={checkboxId} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleCheckboxChange("brands", brand)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{brand}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Year
              </h3>
              <div className="mt-4 space-y-3">
                {YEAR_OPTIONS.map((option) => {
                  const radioId = `year-${option.value}`;

                  return (
                    <label key={option.value} htmlFor={radioId} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        id={radioId}
                        type="radio"
                        name="year"
                        checked={filters.year === String(option.value)}
                        onChange={() => handleRadioChange("year", String(option.value))}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Fuel Type
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {FUEL_OPTIONS.map((fuelType) => {
                  const checkboxId = `fuel-${fuelType.toLowerCase()}`;

                  return (
                    <label key={fuelType} htmlFor={checkboxId} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={filters.fuelTypes.includes(fuelType)}
                        onChange={() => handleCheckboxChange("fuelTypes", fuelType)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{fuelType}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Transmission
              </h3>
              <div className="mt-4 space-y-3">
                {TRANSMISSION_OPTIONS.map((transmission) => {
                  const radioId = `transmission-${transmission.toLowerCase()}`;

                  return (
                    <label key={transmission} htmlFor={radioId} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        id={radioId}
                        type="radio"
                        name="transmission"
                        checked={filters.transmission === transmission}
                        onChange={() => handleRadioChange("transmission", transmission)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{transmission}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
