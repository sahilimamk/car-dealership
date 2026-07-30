import { useState } from "react";

export default function SearchBar({
  totalVehicles = 0,
  onSearch = () => {},
  onFilter = () => {},
}) {
  // Search text
  const [query, setQuery] = useState("");

  // Filters
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Show / Hide filter panel
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Sedan", "SUV", "Coupe", "Truck", "Hatchback"];

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }

  function handleCategoryChange(cat) {
    const nextCat = category === cat ? "" : cat;
    setCategory(nextCat);

    onFilter({
      category: nextCat,
      min: minPrice,
      max: maxPrice,
    });
  }

  function handlePriceChange(min, max) {
    setMinPrice(min);
    setMaxPrice(max);

    onFilter({
      category,
      min,
      max,
    });
  }

  function clearAll() {
    setQuery("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");

    onSearch("");

    onFilter({
      category: "",
      min: "",
      max: "",
    });
  }

  const hasActiveFilters =
    query || category || minPrice || maxPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 space-y-4">

      {/* Search Row */}
      <div className="flex flex-col lg:flex-row gap-3 items-center">

        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg
            className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search make, model or year..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition ${
            showFilters || category || minPrice || maxPrice
              ? "bg-blue-100 border-blue-500 text-blue-700"
              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Filters

          {(category || minPrice || maxPrice) && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-5">

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Category
            </label>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-2 rounded-lg border text-sm transition ${
                    category === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Price Range
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Minimum"
                value={minPrice}
                onChange={(e) =>
                  handlePriceChange(e.target.value, maxPrice)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <span className="text-gray-500">—</span>

              <input
                type="number"
                placeholder="Maximum"
                value={maxPrice}
                onChange={(e) =>
                  handlePriceChange(minPrice, e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-gray-200 pt-4 gap-3">

            <span className="text-sm font-medium text-gray-600">
              Total Vehicles:{" "}
              <span className="font-bold text-gray-900">
                {totalVehicles}
              </span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-red-600 hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}