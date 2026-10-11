import React from 'react';
import { Search, SlidersHorizontal, Map, Grid, X } from 'lucide-react';

const CATEGORIES = ['All', 'Bakery', 'Restaurant', 'Grocery', 'Other'];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeToggle,
  totalResults = 0,
}) {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-4 sm:p-5 shadow-card space-y-4">
      {/* Top Search bar & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search surplus meals, bakeries, groceries, or street..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Toggle (Grid vs Map) */}
        <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => onViewModeToggle('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => onViewModeToggle('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-slate-600 hover:text-forest-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Map
          </button>
        </div>
      </div>

      {/* Category Pills & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'bg-cream-100 text-slate-600 hover:bg-cream-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-forest-900">{totalResults}</span> live surplus {totalResults === 1 ? 'bundle' : 'bundles'}
        </div>
      </div>
    </div>
  );
}
