import { useState } from 'react';
import { purchaseVehicle, deleteVehicle } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';

const VehicleCard = ({ vehicle, onPurchase, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const {
    id,
    make        = 'Unknown',
    model       = 'Unknown',
    year        = '',
    price       = 0,
    mileage     = 0,
    transmission,
    fuelType,
    bodyType,
    color,
    quantity    = 0,
    imageUrl    = null,
    description = null,
  } = vehicle || {};

  const isOutOfStock = quantity === 0;
  const [purchasing,  setPurchasing]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState('');

  async function handlePurchase() {
    if (isOutOfStock || purchasing) return;
    setPurchasing(true);
    setPurchaseMsg('');
    try {
      const result = await purchaseVehicle(id);
      setPurchaseMsg('✓ Purchased!');
      if (onPurchase) onPurchase(result.vehicle);
    } catch (err) {
      setPurchaseMsg(err?.data?.error || err?.message || 'Purchase failed.');
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
      alert(err?.data?.error || err?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  const specs = [
    { label: 'Fuel',         value: fuelType     || '—' },
    { label: 'Transmission', value: transmission  || '—' },
    { label: 'Body',         value: bodyType      || '—' },
    { label: 'Color',        value: color         || '—' },
    { label: 'Mileage',      value: (mileage ?? 0).toLocaleString() + ' km' },
    { label: 'Stock',        value: quantity, isStock: true },
  ];

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">

      {/* ── Image ── */}
      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl || '/car-placeholder.svg'}
          alt={`${year} ${make} ${model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/car-placeholder.svg'; }}
        />

        {/* Stock badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow ${
          isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => onEdit && onEdit(vehicle)}
              className="rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
            >
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-grow p-4 gap-3">

        {/* Title + Price on separate lines — no overflow fighting */}
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-1">
            {year} {make} {model}
          </h3>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
          )}
          {/* Price — always on its own line, prominent */}
          <p className="mt-2 text-2xl font-extrabold text-blue-600 tracking-tight">
            ${Number(price).toLocaleString()}
          </p>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs">
          {specs.map(({ label, value, isStock }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {label}
              </span>
              <span className={`font-semibold truncate ${
                isStock
                  ? isOutOfStock ? 'text-red-600' : 'text-emerald-600'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {String(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Feedback message */}
        {purchaseMsg && (
          <p className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
            purchaseMsg.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {purchaseMsg}
          </p>
        )}

        {/* Actions — pushed to bottom */}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isOutOfStock || purchasing}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : purchasing
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
            }`}
          >
            {purchasing ? 'Processing…' : isOutOfStock ? 'Out of Stock' : 'Purchase'}
          </button>

          {isOutOfStock && isAdmin && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(vehicle)}
              className="w-full py-2 rounded-xl text-xs font-semibold border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
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
