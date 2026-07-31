import { useState } from 'react';
import { purchaseVehicle, deleteVehicle } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';

const VehicleCard = ({ vehicle, onPurchase, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const {
    id,
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
    imageUrl = null,
    description = null,
  } = vehicle || {};

  const isOutOfStock = quantity === 0;
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState('');

  async function handlePurchase() {
    if (isOutOfStock || purchasing) return;
    setPurchasing(true);
    setPurchaseMsg('');
    try {
      const result = await purchaseVehicle(id);
      setPurchaseMsg('✓ Purchase successful!');
      if (onPurchase) onPurchase(result.vehicle);
    } catch (err) {
      // apiFetch throws a plain Error with .data attached
      const msg = err?.data?.error || err?.message || 'Purchase failed.';
      setPurchaseMsg(msg);
    } finally {
      setPurchasing(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${year} ${make} ${model}?`)) return;
    setDeleting(true);
    try {
      await deleteVehicle(id);
      if (onDelete) onDelete(id);
    } catch (err) {
      const msg = err?.data?.error || err?.message || 'Delete failed. Please try again.';
      alert(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 group">
      {/* Image Container */}
      <div className="w-full h-52 bg-gray-100 relative flex items-center justify-center border-b border-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${year} ${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/car-placeholder.svg';
            }}
          />
        ) : (
          <img
            src="/car-placeholder.svg"
            alt={`${year} ${make} ${model}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Stock Badge */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold text-white shadow-sm ${
            isOutOfStock ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </div>

        {/* Edit / Delete controls — admin only */}
        {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(vehicle)}
            className="rounded-md bg-white/90 backdrop-blur px-2 py-1 text-xs font-semibold text-gray-700 shadow hover:bg-blue-600 hover:text-white transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-white/90 backdrop-blur px-2 py-1 text-xs font-semibold text-red-600 shadow hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="pr-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {year} {make} {model}
            </h3>
            {description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>
          <div className="text-xl font-extrabold text-blue-600 whitespace-nowrap">
            ${price.toLocaleString()}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mt-4 mb-4 bg-gray-50 p-4 rounded-lg flex-grow">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Mileage</span>
            <span className="font-medium text-gray-800 truncate">{(mileage ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Fuel</span>
            <span className="font-medium text-gray-800 truncate">{fuelType ?? 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Transmission</span>
            <span className="font-medium text-gray-800 truncate">{transmission ?? 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Body</span>
            <span className="font-medium text-gray-800 truncate">{bodyType ?? 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Color</span>
            <span className="font-medium text-gray-800 truncate">{color ?? 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Quantity</span>
            <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {quantity}
            </span>
          </div>
        </div>

        {/* Purchase feedback */}
        {purchaseMsg && (
          <p className={`text-xs mb-2 font-medium ${purchaseMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {purchaseMsg}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          {/* Purchase button — disabled when out of stock */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isOutOfStock || purchasing}
            className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {purchasing ? 'Processing…' : isOutOfStock ? 'Out of Stock' : 'Purchase'}
          </button>

          {/* Restock — shown when out of stock, admin only */}
          {isOutOfStock && isAdmin && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(vehicle)}
              className="w-full py-2 text-xs font-semibold rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              Restock via Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;