import React, { useEffect, useState } from 'react';
import { bundleService } from '../services/bundleService';
import FilterBar from '../components/marketplace/FilterBar';
import FoodBundleCard from '../components/marketplace/FoodBundleCard';
import StoreMapView from '../components/marketplace/StoreMapView';
import ReserveModal from '../components/marketplace/ReserveModal';
import { ShoppingBag, Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function CustomerMarketplacePage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Reserve modal state
  const [selectedBundle, setSelectedBundle] = useState(null);

  const loadBundles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bundleService.getMarketplaceBundles({
        category: selectedCategory,
        search: searchQuery,
      });
      setBundles(data);
    } catch (err) {
      console.error('Error loading bundles:', err);
      setError(err.message || 'Unable to retrieve marketplace listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>Today's Surplus Rescues</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Surplus Food Marketplace
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Reserve delicious meals and fresh produce from local Nagpur shops at steep discounts before pickup windows expire.
          </p>
        </div>

        <button
          onClick={loadBundles}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Listings
        </button>
      </div>

      {/* Filter and View Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeToggle={setViewMode}
        totalResults={bundles.length}
      />

      {/* Error notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold">Error loading live listings:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Discovering surplus bundles near you...</p>
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center shadow-card max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Food Bundles Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or switching to another category.'
                : 'There are no active surplus listings right now. Merchants publish new bundles as items near closing.'}
            </p>
          </div>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <FoodBundleCard
              key={bundle.id}
              bundle={bundle}
              onQuickReserve={(b) => setSelectedBundle(b)}
            />
          ))}
        </div>
      ) : (
        /* Map View */
        <StoreMapView
          bundles={bundles}
          onSelectStore={(store) => {
            setSearchQuery(store.name);
            setViewMode('grid');
          }}
        />
      )}

      {/* Reserve Modal */}
      {selectedBundle && (
        <ReserveModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          onReservationSuccess={() => {
            loadBundles();
          }}
        />
      )}

    </div>
  );
}
