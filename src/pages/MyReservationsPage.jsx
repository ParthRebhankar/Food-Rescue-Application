import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ShoppingBag, 
  ArrowRight,
  RefreshCw,
  Scale
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDateTime, 
  formatPickupDeadline, 
  getStatusBadgeClasses 
} from '../utils/formatters';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const loadReservations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await reservationService.getCustomerReservations(user.id);
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      notifyError('Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [user?.id]);

  const handleCancel = async (resId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The bundle will be restocked for other community members.')) {
      return;
    }

    setCancellingId(resId);
    try {
      await reservationService.cancelReservation(resId);
      notifySuccess('Reservation cancelled and inventory restored.');
      await loadReservations();
    } catch (err) {
      console.error('Cancellation error:', err);
      notifyError(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Customer Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Food Reservations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track active pickup passes, order codes, and your history of rescued meals.
          </p>
        </div>

        <button
          onClick={loadReservations}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Reservations List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading your reservations...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center shadow-card max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You haven't reserved any surplus food bundles yet. Explore the marketplace to claim surprise bags from local bakeries and markets.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const bundle = res.bundle;
            const store = bundle?.restaurant;
            const isReserved = res.status === 'reserved';
            const isPickedUp = res.status === 'picked_up';
            const isCancelled = res.status === 'cancelled';

            return (
              <div
                key={res.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isReserved ? 'border-forest-300' : 'border-cream-200 opacity-90'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-4 flex-1">
                  {bundle?.image_url && (
                    <img
                      src={bundle.image_url}
                      alt={bundle.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0 border border-cream-200"
                    />
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeClasses(res.status)}`}>
                        {res.status === 'reserved' ? 'Awaiting Pickup' : res.status === 'picked_up' ? 'Collected' : 'Cancelled'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reserved on {formatDateTime(res.created_at)}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate">
                      {bundle?.title || 'Surplus Food Bundle'}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {store?.name || 'Local Merchant'}
                      </span>
                      <span>•</span>
                      <span>{res.quantity} bundle(s)</span>
                      <span>•</span>
                      <span className="font-bold text-forest-900">{formatCurrency(res.total_price)} total</span>
                    </div>

                    {store?.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </p>
                    )}

                    {isReserved && bundle?.pickup_deadline && (
                      <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Deadline: {formatPickupDeadline(bundle.pickup_deadline)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action / Pickup Passcode */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 md:border-l border-cream-200 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                  {isReserved ? (
                    <>
                      <div className="bg-cream-100/80 border border-forest-300 rounded-xl p-3 text-center w-full">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Passcode for Merchant
                        </span>
                        <span className="text-xl font-mono font-black text-forest-900 tracking-wider">
                          {res.pickup_code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={cancellingId === res.id}
                        className="w-full text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 py-2 rounded-xl transition-colors disabled:opacity-50 text-center"
                      >
                        {cancellingId === res.id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    </>
                  ) : isPickedUp ? (
                    <div className="text-right w-full space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Picked Up &amp; Verified
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Rescued ~{((bundle?.weight_kg || 1) * res.quantity).toFixed(1)} kg food waste
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium italic">
                      Reservation cancelled
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
