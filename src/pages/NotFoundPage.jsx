import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-card">
        <div className="w-16 h-16 bg-cream-100 text-forest-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Sprout className="w-8 h-8 text-forest-700" />
        </div>
        
        <div>
          <span className="text-4xl sm:text-5xl font-black text-forest-900 tracking-tight block">
            404
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page or surplus bundle listing you are looking for does not exist or may have expired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-cream-100 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            to="/customer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
