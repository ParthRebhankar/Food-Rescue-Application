import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bundleService } from '../services/bundleService';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Scale, 
  Store, 
  ShoppingBag, 
  Sparkles, 
  Phone, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  formatCurrency, 
  calculateDiscountPercent, 
  formatPickupDeadline,
  getCategoryBadgeClasses 
} from '../utils/formatters';
import ReserveModal from '../components/marketplace/ReserveModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createStoreMapIcon } from '../utils/leafletConfig';

export default function BundleDetailPage() {
  const { id } = useParams();

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  useEffect(() => {
    async function loadBundle() {
      setLoading(true);
      setError(null);
      try {
        const data = await bundleService.getBundleById(id);
        if (!data) {
          setError('Food bundle not found or has been removed.');
        } else {
          setBundle(data);
        }
      } catch (err) {
        console.error('Error fetching bundle:', err);
        setError(err.message || 'Failed to retrieve food bundle details.');
      } finally {
        setLoading(false);
      }
    }
    loadBundle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading bundle details...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Bundle Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'This listing may have expired or is unavailable.'}</p>
        <div className="pt-2">
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-800 text-white font-bold rounded-xl text-xs hover:bg-forest-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const store = bundle.restaurant;
  const discountPercent = calculateDiscountPercent(bundle.original_price, bundle.discounted_price);
  const isExpired = new Date(bundle.pickup_deadline) <= new Date();
  const isSoldOut = bundle.available_quantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-forest-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-forest-700" /> Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-card border border-cream-200 bg-cream-100 h-80 sm:h-96">
            <img
              src={bundle.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
              alt={bundle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getCategoryBadgeClasses(bundle.category)}`}>
                {bundle.category}
              </span>
              {discountPercent > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider block mb-1">
                {store?.name || 'Local Store'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black drop-shadow leading-tight">
                {bundle.title}
              </h1>
            </div>
          </div>

          {/* Description & Attributes */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                What's In The Surplus Bundle
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {bundle.description || 'This surprise surplus bundle contains fresh items prepared or baked today, rescued to prevent unnecessary food waste.'}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-forest-700" /> Approx Weight
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {bundle.weight_kg} kg / bundle
                </span>
              </div>

              <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pickup Deadline
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatPickupDeadline(bundle.pickup_deadline)}
                </span>
              </div>

              <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-forest-700" /> Inventory
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {bundle.available_quantity} remaining
                </span>
              </div>
            </div>

            {/* Sustainability Impact Highlight */}
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-forest-900 text-xs">Direct Carbon Impact</h4>
                <p className="text-xs text-forest-700 mt-0.5">
                  Rescuing this bundle avoids approximately <strong>{(bundle.weight_kg * 2.5).toFixed(2)} kg CO2e</strong> from greenhouse emissions!
                </p>
              </div>
            </div>
          </div>

          {/* Store Location on Map */}
          {store?.latitude && store?.longitude && (
            <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-card">
              <div className="p-4 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-forest-700" /> Pickup Location Map
                </span>
                <span className="text-xs text-slate-500">{store.address}</span>
              </div>
              <div className="h-64 w-full">
                <MapContainer
                  center={[store.latitude, store.longitude]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[store.latitude, store.longitude]}
                    icon={createStoreMapIcon(store.category)}
                  >
                    <Popup>
                      <div className="p-2 text-xs">
                        <strong>{store.name}</strong>
                        <p>{store.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Reservation Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-card space-y-6 sticky top-24">
            
            {/* Price Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Discounted Surplus Rate
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-forest-900">
                  {formatCurrency(bundle.discounted_price)}
                </span>
                {bundle.original_price > bundle.discounted_price && (
                  <span className="text-base text-slate-400 line-through">
                    {formatCurrency(bundle.original_price)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save {formatCurrency(bundle.original_price - bundle.discounted_price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Includes all taxes. Pay merchant in-person upon collection.
              </p>
            </div>

            {/* Merchant Info Card */}
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Store className="w-4 h-4 text-forest-700" />
                <span>{store?.name || 'Local Merchant'}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0 mt-0.5" />
                <span>{store?.address}</span>
              </div>
              {store?.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                  <span>{store.phone}</span>
                </div>
              )}
            </div>

            {/* Reserve CTA */}
            <div className="space-y-3">
              {isExpired ? (
                <div className="bg-slate-100 text-slate-600 p-3.5 rounded-xl text-center text-xs font-bold">
                  Pickup window expired for this bundle
                </div>
              ) : isSoldOut ? (
                <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-center text-xs font-bold border border-rose-200">
                  Sold Out! All bundles have been reserved.
                </div>
              ) : (
                <button
                  onClick={() => setReserveModalOpen(true)}
                  className="w-full py-4 px-6 bg-forest-800 hover:bg-forest-900 text-white font-black rounded-2xl text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  Reserve This Food Bundle
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                By reserving, you commit to picking up the package before <strong>{formatPickupDeadline(bundle.pickup_deadline)}</strong>.
              </p>
            </div>

            {/* Trust points */}
            <div className="border-t border-cream-200 pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero upfront card charges for this demo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Immediate pickup code generated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cancelable if plans change</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Reserve Modal */}
      {reserveModalOpen && (
        <ReserveModal
          bundle={bundle}
          onClose={() => setReserveModalOpen(false)}
          onReservationSuccess={() => {
            // refresh bundle data
            bundleService.getBundleById(id).then(setBundle);
          }}
        />
      )}

    </div>
  );
}
