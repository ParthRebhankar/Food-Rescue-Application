import React, { useState } from 'react';
import { CheckCircle2, X, AlertCircle, User, Package, Calendar, ArrowRight } from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

export default function PickupConfirmationModal({ reservation, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  if (!reservation) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await reservationService.confirmPickup(reservation.id);
      notifySuccess(`Pickup confirmed for reservation #${reservation.pickup_code}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Pickup confirmation error:', err);
      notifyError(err.message || 'Failed to confirm pickup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-cream-200 transition-all">
        
        {/* Header */}
        <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Confirm Food Collection
              </h3>
              <p className="text-xs text-slate-500">
                Code: {reservation.pickup_code}
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify that the customer has collected their bundle at your store counter before confirming. This will officially calculate rescued food weight and update environmental impact.
          </p>

          {/* Details */}
          <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">
                {reservation.customer?.full_name || reservation.customer?.email || 'Registered Customer'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Food Bundle:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {reservation.bundle?.title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Quantity Rescued:</span>
              <span className="font-bold text-slate-900">
                {reservation.quantity} item(s) (approx. {(reservation.bundle?.weight_kg || 1) * reservation.quantity} kg)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Amount Collected:</span>
              <span className="font-black text-forest-900 text-sm">
                {formatCurrency(reservation.total_price)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-cream-200">
              <span className="text-slate-500 font-medium">Reserved On:</span>
              <span className="text-slate-700">
                {formatDateTime(reservation.created_at)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
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
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {loading ? 'Confirming...' : 'Mark as Collected'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
