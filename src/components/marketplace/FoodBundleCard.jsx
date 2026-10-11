import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Scale, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  Store
} from 'lucide-react';
import { 
  formatCurrency, 
  calculateDiscountPercent, 
  formatPickupDeadline,
  getCategoryBadgeClasses
} from '../../utils/formatters';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

export default function FoodBundleCard({ bundle, onQuickReserve }) {
  const [imgSrc, setImgSrc] = useState(bundle.image_url || DEFAULT_FOOD_IMAGE);

  const discountPercent = calculateDiscountPercent(bundle.original_price, bundle.discounted_price);
  const remaining = bundle.available_quantity;
  const store = bundle.restaurant;

  return (
    <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card hover:shadow-lifted transition-all duration-300 flex flex-col group">
      
      {/* Top Image & Overlays */}
      <div className="relative h-48 w-full bg-cream-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={bundle.title}
          onError={() => setImgSrc(DEFAULT_FOOD_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category & Discount Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getCategoryBadgeClasses(bundle.category)}`}>
            {bundle.category}
          </span>
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quantity Remaining Pill */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
            remaining <= 2 
              ? 'bg-rose-500/90 text-white animate-pulse' 
              : 'bg-forest-900/80 text-cream-100'
          }`}>
            {remaining} left
          </span>
        </div>

        {/* Store Name Overlaid */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold flex items-center gap-1 truncate drop-shadow">
            <Store className="w-3.5 h-3.5 text-cream-200 flex-shrink-0" />
            <span className="truncate">{store?.name || 'Local Merchant'}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-cream-200 flex-shrink-0 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Scale className="w-3 h-3 text-emerald-300" />
            {bundle.weight_kg} kg
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-forest-800 transition-colors line-clamp-1">
            {bundle.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mt-1.5 leading-relaxed">
            {bundle.description || 'Assorted surplus fresh items carefully rescued for your table.'}
          </p>

          {/* Location and Deadline info */}
          <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
            {store?.address && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                <span className="truncate">{store.address}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-amber-800 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Pickup: {formatPickupDeadline(bundle.pickup_deadline)}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-cream-200 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-forest-900">
                {formatCurrency(bundle.discounted_price)}
              </span>
              {bundle.original_price > bundle.discounted_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(bundle.original_price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">
              Pay at pickup
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/bundle/${bundle.id}`}
              className="p-2 text-slate-600 hover:text-forest-900 hover:bg-cream-100 rounded-xl transition-colors text-xs font-semibold"
              title="View bundle details"
            >
              Details
            </Link>

            <button
              onClick={() => onQuickReserve(bundle)}
              className="px-3.5 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Reserve
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
