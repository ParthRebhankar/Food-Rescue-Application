import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Leaf, 
  Scale, 
  Wind, 
  Clock, 
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { impactService } from '../services/impactService';
import { bundleService } from '../services/bundleService';
import FoodBundleCard from '../components/marketplace/FoodBundleCard';
import ReserveModal from '../components/marketplace/ReserveModal';
import { formatCurrency } from '../utils/formatters';

export default function LandingPage() {
  const [impact, setImpact] = useState(null);
  const [featuredBundles, setFeaturedBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [impactData, bundles] = await Promise.all([
          impactService.getGlobalImpact(),
          bundleService.getMarketplaceBundles(),
        ]);
        setImpact(impactData);
        setFeaturedBundles(bundles.slice(0, 3));
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-cream-100/80 via-cream-50 to-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 border border-forest-200 text-forest-900 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-forest-700" />
                <span>Hyperlocal Surplus Food Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Rescue Delicious Meals. <br />
                <span className="text-forest-800 underline decoration-emerald-400 decoration-wavy decoration-2">
                  Cut Food Waste.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Local bakeries, grocery stores, and restaurants bundle wholesome end-of-day food at up to <strong className="text-forest-900 font-bold">70% discount</strong>. Discover surplus packages near you and track your verified carbon reduction.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/customer"
                  className="w-full sm:w-auto px-7 py-3.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group text-base"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  Explore Live Marketplace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-cream-100 text-forest-900 font-bold rounded-2xl border border-cream-300 shadow-sm transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Store className="w-5 h-5 text-forest-700" />
                  List As A Merchant
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pay upon pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified local stores
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Science-backed CO2e metric
                </span>
              </div>
            </div>

            {/* Right Column Featured Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                    alt="Fresh surplus groceries and bread"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Floating preview banner */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-cream-200 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Nagpur Pilot Active
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          Artisan Bakery &amp; Farm Pantry Surplus
                        </h4>
                      </div>
                      <span className="text-lg font-black text-forest-800">
                        ₹180 <span className="text-xs text-slate-400 line-through font-normal">₹450</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative floating badge */}
                <div className="absolute -top-4 -right-4 bg-emerald-700 text-white rounded-2xl p-3 shadow-xl hidden sm:flex items-center gap-2 border-2 border-white">
                  <Wind className="w-5 h-5 text-emerald-300" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-200">Avoided Emissions</div>
                    <div className="text-xs font-black">2.5 kg CO2e / kg</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-time Environmental Metric Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-forest-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Community Impact Counter
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 text-cream-50">
              Measurable Climate Protection
            </h2>
            <p className="text-xs sm:text-sm text-forest-200 mt-2">
              Metrics calculated strictly upon verified merchant pickup confirmation using documented FAO emission benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-forest-950/50 rounded-2xl p-6 border border-forest-800">
              <Scale className="w-7 h-7 mx-auto text-emerald-400 mb-2" />
              <div className="text-3xl sm:text-4xl font-black text-white">
                {impact?.metrics?.foodRescuedKg || '0'} <span className="text-lg font-bold text-emerald-300">kg</span>
              </div>
              <p className="text-xs font-medium text-forest-200 mt-1">Rescued Edible Food</p>
            </div>

            <div className="bg-forest-950/50 rounded-2xl p-6 border border-forest-800">
              <Wind className="w-7 h-7 mx-auto text-emerald-400 mb-2" />
              <div className="text-3xl sm:text-4xl font-black text-white">
                {impact?.metrics?.co2AvoidedKg || '0'} <span className="text-lg font-bold text-emerald-300">kg CO2e</span>
              </div>
              <p className="text-xs font-medium text-forest-200 mt-1">Greenhouse Emissions Avoided</p>
            </div>

            <div className="bg-forest-950/50 rounded-2xl p-6 border border-forest-800">
              <ShoppingBag className="w-7 h-7 mx-auto text-emerald-400 mb-2" />
              <div className="text-3xl sm:text-4xl font-black text-white">
                {impact?.totalBundlesCollected || '0'}
              </div>
              <p className="text-xs font-medium text-forest-200 mt-1">Surplus Bundles Collected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Bundles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Live Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Available Near You Today
            </h2>
          </div>

          <Link
            to="/customer"
            className="text-xs sm:text-sm font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 group"
          >
            Browse all bundles on map
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredBundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBundles.map((bundle) => (
              <FoodBundleCard
                key={bundle.id}
                bundle={bundle}
                onQuickReserve={(b) => setSelectedBundle(b)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active bundles currently listed.</p>
            <p className="text-xs text-slate-500 mt-1">Sign in as a merchant to publish surplus bundles or explore sample data.</p>
          </div>
        )}
      </section>

      {/* How It Works Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            How The Subscription &amp; Planner Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-cream-100 text-forest-800 rounded-2xl flex items-center justify-center mx-auto font-black text-lg border border-cream-200">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Explore Surplus Bundles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse surprise bakery bags, grocery crates, and dinner boxes near your neighborhood on the interactive map.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-cream-100 text-forest-800 rounded-2xl flex items-center justify-center mx-auto font-black text-lg border border-cream-200">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Instant Reservation Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reserve your chosen quantity. You receive an instant digital pickup passcode without needing online prepayment.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-cream-100 text-forest-800 rounded-2xl flex items-center justify-center mx-auto font-black text-lg border border-cream-200">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Collect &amp; Track Impact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect before the pickup deadline, pay at counter, and watch your personal environmental dashboard reflect your saved CO2e.
            </p>
          </div>
        </div>
      </section>

      {/* Reserve Modal */}
      {selectedBundle && (
        <ReserveModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          onReservationSuccess={() => setSelectedBundle(null)}
        />
      )}

    </div>
  );
}
