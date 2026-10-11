import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Receipt,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { formatCurrency, formatPickupDeadline } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ReserveModal({ bundle, onClose, onReservationSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!bundle) return null;

  const maxQty = Math.max(1, bundle.available_quantity || 1);
  const totalPrice = bundle.discounted_price * quantity;
  const totalWeight = (bundle.weight_kg * quantity).toFixed(1);

  const handleReserve = async () => {
    if (!user) {
      notifyError('Please sign in as a customer to reserve this bundle');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const result = await reservationService.createReservation(bundle.id, quantity);
      notifySuccess('Surplus bundle reserved successfully!');
      setSuccessData(result);
      if (onReservationSuccess) onReservationSuccess(result);
    } catch (err) {
      console.error('Reservation error:', err);
      notifyError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-cream-200 transition-all">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {successData ? 'Reservation Confirmed!' : 'Reserve Surplus Food'}
              </h3>
              <p className="text-xs text-slate-500">
                {bundle.restaurant?.name || 'Local Store'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-cream-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successData ? (
            /* Success State */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">Thank You for Rescuing Food!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your reservation has been locked in the database. Present this pickup code to the merchant at collection.
                </p>
              </div>

              {/* Pickup Code Display */}
              <div className="bg-cream-50 border-2 border-dashed border-forest-300 rounded-2xl p-4 max-w-xs mx-auto">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Your Pickup Passcode
                </span>
                <span className="text-2xl font-mono font-black text-forest-800 tracking-wider">
                  {successData.pickup_code || 'PK-VERIFIED'}
                </span>
              </div>

              {/* Pickup Location Reminder */}
              <div className="bg-forest-50/60 rounded-xl p-3 text-left text-xs space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-forest-900">
                  <MapPin className="w-3.5 h-3.5 text-forest-700" />
                  <span>Pickup Store: {bundle.restaurant?.name}</span>
                </div>
                <p className="pl-5 text-slate-600">{bundle.restaurant?.address}</p>
                <div className="flex items-center gap-1.5 text-amber-800 pt-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Before: {formatPickupDeadline(bundle.pickup_deadline)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/reservations');
                  }}
                  className="w-full py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  View My Reservations <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form State */
            <>
              {/* Bundle summary */}
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
                {bundle.image_url && (
                  <img
                    src={bundle.image_url}
                    alt={bundle.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{bundle.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-forest-800">{formatCurrency(bundle.discounted_price)} each</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-forest-700" /> {bundle.weight_kg} kg/bundle
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Quantity to Rescue (Max: {bundle.available_quantity})
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-cream-300 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 text-slate-700 hover:bg-cream-100 disabled:opacity-30 font-bold text-base"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-bold text-slate-900 text-sm min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      disabled={quantity >= maxQty}
                      className="px-3.5 py-2 text-slate-700 hover:bg-cream-100 disabled:opacity-30 font-bold text-base"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Rescuing ~<strong>{totalWeight} kg</strong> of food waste
                  </span>
                </div>
              </div>

              {/* Price summary table */}
              <div className="bg-cream-50/60 rounded-2xl p-4 border border-cream-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Discounted Bundle Price ({quantity}x)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Waste Diversion Fee</span>
                  <span className="text-emerald-700 font-semibold">Free (Sponsored)</span>
                </div>
                <div className="pt-2 border-t border-cream-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Total Amount Due at Pickup</span>
                  <span className="text-forest-900 text-base">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Demo payment notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <Receipt className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice:</strong> For this demo prototype, no card payment is required. You will receive an instant pickup code and pay <strong>{formatCurrency(totalPrice)}</strong> upon in-person pickup.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={loading || maxQty < 1}
                  className="flex-1 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    'Reserving...'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Confirm Reservation
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
