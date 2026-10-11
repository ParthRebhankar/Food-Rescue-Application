import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bundleService } from '../services/bundleService';
import { reservationService } from '../services/reservationService';
import { restaurantService } from '../services/restaurantService';
import { impactService } from '../services/impactService';
import StatsCard from '../components/merchant/StatsCard';
import PickupConfirmationModal from '../components/merchant/PickupConfirmationModal';
import { 
  Store, 
  ShoppingBag, 
  PackageCheck, 
  Scale, 
  PlusCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  ArrowRight,
  Database,
  Building2,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatPickupDeadline, getStatusBadgeClasses } from '../utils/formatters';

export default function MerchantDashboardPage() {
  const { user, profile } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [impact, setImpact] = useState(null);
  
  // Seeding state
  const [seeding, setSeeding] = useState(false);
  // Pickup modal
  const [selectedReservation, setSelectedReservation] = useState(null);

  const loadMerchantData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [storesData, bundlesData, reservationsData, impactData] = await Promise.all([
        restaurantService.getMerchantRestaurants(user.id),
        bundleService.getMerchantBundles(user.id),
        reservationService.getMerchantReservations(user.id),
        impactService.getMerchantImpact(user.id),
      ]);

      setStores(storesData);
      setBundles(bundlesData);
      setReservations(reservationsData);
      setImpact(impactData);
    } catch (err) {
      console.error('Error fetching merchant dashboard data:', err);
      notifyError('Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchantData();
  }, [user?.id]);

  const handleSeedDemoData = async () => {
    if (!user?.id) return;
    setSeeding(true);
    try {
      await restaurantService.seedDemoStoresForMerchant(user.id);
      notifySuccess('Nagpur demo stores and bundles seeded successfully!');
      await loadMerchantData();
    } catch (err) {
      console.error('Seeding error:', err);
      notifyError(err.message || 'Failed to seed sample data.');
    } finally {
      setSeeding(false);
    }
  };

  const activeBundlesCount = bundles.filter(b => b.is_active && b.available_quantity > 0).length;
  const pendingPickups = reservations.filter(r => r.status === 'reserved');
  const collectedReservations = reservations.filter(r => r.status === 'picked_up');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5 text-forest-700" />
            <span>Merchant Operations Command</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Merchant Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back, <strong className="text-slate-800">{profile?.full_name || user?.email}</strong>. Manage listings, confirm collections, and track rescued food.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadMerchantData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            to="/merchant/bundle/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Food Bundle
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Listings"
          value={activeBundlesCount}
          subtitle={`${bundles.length} total bundles listed`}
          icon={ShoppingBag}
          color="forest"
        />

        <StatsCard
          title="Total Reservations"
          value={reservations.length}
          subtitle={`${pendingPickups.length} pending pickup today`}
          icon={Calendar}
          color="blue"
        />

        <StatsCard
          title="Bundles Collected"
          value={collectedReservations.length}
          subtitle="Confirmed in-person customer pickups"
          icon={PackageCheck}
          color="emerald"
        />

        <StatsCard
          title="Food Rescued"
          value={`${impact?.metrics?.foodRescuedKg || 0} kg`}
          subtitle={`Avoided ${impact?.metrics?.co2AvoidedKg || 0} kg CO2e`}
          icon={Scale}
          color="amber"
        />
      </div>

      {/* Quick Setup / Demo Data Banner if merchant has 0 stores */}
      {stores.length === 0 && !loading && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Hackathon Demo Accelerator
            </div>
            <h3 className="text-lg font-black text-slate-900">
              No store locations registered under your account yet
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              To immediately test browsing bundles, maps, and making customer reservations, populate 4 demo Nagpur stores (Green Crust Bakery, Heritage Farm Pantry, Bhojnam Kitchen, etc.) with preconfigured coordinates.
            </p>
          </div>

          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Seeding Demo Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" /> Seed Nagpur Demo Stores &amp; Bundles
              </>
            )}
          </button>
        </div>
      )}

      {/* Two Column Layout: Pending Pickups & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pending Pickups awaiting confirmation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-forest-700" />
              Pending Customer Pickups ({pendingPickups.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Verify code upon pickup</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading reservations...
            </div>
          ) : pendingPickups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center shadow-card text-xs text-slate-500">
              No active reservations currently waiting for collection.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPickups.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-cream-200 p-4 sm:p-5 shadow-card hover:border-forest-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cream-100 text-forest-900 border border-cream-200">
                        CODE: {res.pickup_code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {res.customer?.full_name || res.customer?.email || 'Customer'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {res.bundle?.title}
                    </h4>

                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{res.quantity} bundle(s)</span>
                      <span>•</span>
                      <span className="font-bold text-forest-900">{formatCurrency(res.total_price)}</span>
                      <span>•</span>
                      <span>{formatDateTime(res.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReservation(res)}
                    className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Pickup
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Listing Snapshot & Stores */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-forest-700" />
                My Stores ({stores.length})
              </h3>
              <Link
                to="/merchant/listings"
                className="text-xs font-bold text-forest-800 hover:underline"
              >
                View Listings
              </Link>
            </div>

            {stores.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                No stores registered yet. Click the button above to load demo stores or create your first store listing.
              </p>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div key={store.id} className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{store.name}</span>
                      <span className="text-[10px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded">
                        {store.category}
                      </span>
                    </div>
                    <p className="text-slate-500 truncate">{store.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-card space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/merchant/bundle/new"
                className="flex items-center justify-between p-3 rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors text-xs font-bold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-forest-700" /> List New Food Bundle
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/merchant/listings"
                className="flex items-center justify-between p-3 rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors text-xs font-bold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-forest-700" /> Manage All Bundles &amp; Inventory
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/impact"
                className="flex items-center justify-between p-3 rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors text-xs font-bold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-forest-700" /> View Detailed Carbon Ledger
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Pickup Confirmation Modal */}
      {selectedReservation && (
        <PickupConfirmationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onSuccess={() => {
            loadMerchantData();
          }}
        />
      )}

    </div>
  );
}
