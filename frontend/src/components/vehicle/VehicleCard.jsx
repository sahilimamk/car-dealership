import React from 'react';

const VehicleCard = ({ vehicle }) => {
  // Destructure vehicle object with default fallbacks
  const {
    make = 'Unknown Make',
    model = 'Unknown Model',
    year = 'N/A',
    price = 0,
    mileage = 0,
    transmission = 'N/A',
    fuelType = 'N/A',
    bodyType = 'N/A',
    color = 'N/A',
    quantity = 0,
    image = null,
  } = vehicle || {};

  const isOutOfStock = quantity === 0;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 group">
      {/* Image Container */}
      <div className="w-full h-52 bg-gray-100 relative flex items-center justify-center border-b border-gray-200 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${year} ${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-gray-400 text-sm font-medium">No Image Available</span>
        )}
        
        {/* Stock Badge */}
        <div 
          className={`absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold text-white shadow-sm ${
            isOutOfStock ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </div>

        {/* TODO: Add Admin Edit/Delete controls here in the future */}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="pr-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {year} {make} {model}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{make}</p>
          </div>
          <div className="text-xl font-extrabold text-blue-600">
            ${price.toLocaleString()}
          </div>
        </div>
        
        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mt-4 mb-6 bg-gray-50 p-4 rounded-lg flex-grow">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Mileage</span>
            <span className="font-medium text-gray-800 truncate">{mileage.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Fuel</span>
            <span className="font-medium text-gray-800 truncate">{fuelType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Transmission</span>
            <span className="font-medium text-gray-800 truncate">{transmission}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Body</span>
            <span className="font-medium text-gray-800 truncate">{bodyType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Color</span>
            <span className="font-medium text-gray-800 truncate">{color}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Quantity</span>
            <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {quantity}
            </span>
          </div>
        </div>
        
        {/* Action Buttons Container */}
        <div className="mt-auto space-y-3">
          {/* TODO: Replace View Details with modal navigation. */}
          <button 
            type="button"
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            View Details
          </button>

          {/* TODO: Add Purchase button after backend integration. */}
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;