import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bundleService } from '../services/bundleService';
import { 
  ShoppingBag, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Scale
} from 'lucide-react';
import { formatCurrency, formatPickupDeadline, getCategoryBadgeClasses } from '../utils/formatters';

export default function MerchantListingsPage() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadListings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await bundleService.getMerchantBundles(user.id);
      setBundles(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      notifyError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user?.id]);

  const handleDelete = async (bundleId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setDeletingId(bundleId);
    try {
      await bundleService.deleteBundle(bundleId);
      notifySuccess('Listing removed successfully.');
      setBundles(prev => prev.filter(b => b.id !== bundleId));
    } catch (err) {
      console.error('Delete error:', err);
      notifyError(err.message || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (bundle) => {
    try {
      await bundleService.updateBundle(bundle.id, {
        is_active: !bundle.is_active,
      });
      notifySuccess(`Listing ${!bundle.is_active ? 'activated' : 'paused'}.`);
      setBundles(prev => prev.map(b => b.id === bundle.id ? { ...b, is_active: !b.is_active } : b));
    } catch (err) {
      console.error('Toggle error:', err);
      notifyError('Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-forest-700" />
            <span>Inventory Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Food Bundle Listings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Create, edit, toggle availability, and track remaining stock across all your locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadListings}
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

      {/* Main Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading your bundle catalog...</p>
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-cream-200 p-12 text-center shadow-card max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Listings Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You haven't posted any surplus food bundles yet. Publish your day-end surplus to prevent waste and earn revenue.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/merchant/bundle/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create First Listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-cream-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Bundle &amp; Store</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price (Disc / Orig)</th>
                  <th className="py-4 px-4">Available Qty</th>
                  <th className="py-4 px-4">Pickup Deadline</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-slate-700">
                {bundles.map((bundle) => {
                  const isExpired = new Date(bundle.pickup_deadline) <= new Date();

                  return (
                    <tr key={bundle.id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {bundle.image_url && (
                            <img
                              src={bundle.image_url}
                              alt={bundle.title}
                              className="w-12 h-12 rounded-xl object-cover border border-cream-200 flex-shrink-0"
                            />
                          )}
                          <div className="truncate max-w-[200px]">
                            <span className="font-extrabold text-slate-900 block truncate">
                              {bundle.title}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {bundle.restaurant?.name || 'Local Store'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClasses(bundle.category)}`}>
                          {bundle.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-forest-900 block">
                            {formatCurrency(bundle.discounted_price)}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatCurrency(bundle.original_price)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`font-bold ${bundle.available_quantity === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {bundle.available_quantity} left
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({bundle.weight_kg} kg/item)
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          {formatPickupDeadline(bundle.pickup_deadline)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(bundle)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            bundle.is_active && !isExpired
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {bundle.is_active && !isExpired ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/bundle/${bundle.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-cream-100 rounded-lg transition-colors"
                            title="View public page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/merchant/bundle/edit/${bundle.id}`}
                            className="p-1.5 text-slate-400 hover:text-forest-800 hover:bg-cream-100 rounded-lg transition-colors"
                            title="Edit bundle"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(bundle.id)}
                            disabled={deletingId === bundle.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
