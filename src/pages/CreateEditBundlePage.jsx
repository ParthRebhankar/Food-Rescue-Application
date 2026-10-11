import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bundleService } from '../services/bundleService';
import { restaurantService } from '../services/restaurantService';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = ['Bakery', 'Restaurant', 'Grocery', 'Other'];

// Curated high quality food photography presets
const PHOTO_PRESETS = [
  { label: 'Bakery & Pastries', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Veggies & Fruits', url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cooked Restaurant Meals', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Deli, Juices & Pantry', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
];

export default function CreateEditBundlePage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Bundle form fields
  const [restaurantId, setRestaurantId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Bakery');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('5');
  const [weightKg, setWeightKg] = useState('1.0');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);

  // New store quick-create inline drawer
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Bakery');
  const [newStoreLat, setNewStoreLat] = useState('21.1458');
  const [newStoreLng, setNewStoreLng] = useState('79.0882');
  const [creatingStore, setCreatingStore] = useState(false);

  useEffect(() => {
    async function init() {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Load merchant stores
        let merchantStores = await restaurantService.getMerchantRestaurants(user.id);
        
        // If merchant has no stores yet, seed demo stores automatically for them
        if (merchantStores.length === 0) {
          try {
            merchantStores = await restaurantService.seedDemoStoresForMerchant(user.id);
          } catch (seedErr) {
            console.warn('Auto-seed stores note:', seedErr);
          }
        }

        setStores(merchantStores);
        if (merchantStores.length > 0 && !restaurantId) {
          setRestaurantId(merchantStores[0].id);
        }

        // Default pickup deadline: 8 hours from now
        const defaultDeadline = new Date(Date.now() + 8 * 3600 * 1000);
        // format for datetime-local input YYYY-MM-DDTHH:mm
        const formattedDate = new Date(defaultDeadline.getTime() - defaultDeadline.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setPickupDeadline(formattedDate);

        // If editing, load existing bundle data
        if (isEditing) {
          const bundle = await bundleService.getBundleById(id);
          if (bundle) {
            setRestaurantId(bundle.restaurant_id);
            setTitle(bundle.title);
            setDescription(bundle.description || '');
            setCategory(bundle.category);
            setOriginalPrice(bundle.original_price.toString());
            setDiscountedPrice(bundle.discounted_price.toString());
            setAvailableQuantity(bundle.available_quantity.toString());
            setWeightKg(bundle.weight_kg.toString());
            setImageUrl(bundle.image_url || '');

            if (bundle.pickup_deadline) {
              const d = new Date(bundle.pickup_deadline);
              const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
              setPickupDeadline(iso);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        notifyError('Failed to load store information.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, user?.id]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName || !newStoreAddress) {
      notifyError('Please enter a store name and address');
      return;
    }

    setCreatingStore(true);
    try {
      const created = await restaurantService.createRestaurant(user.id, {
        name: newStoreName,
        address: newStoreAddress,
        category: newStoreCategory,
        latitude: parseFloat(newStoreLat) || 21.1458,
        longitude: parseFloat(newStoreLng) || 79.0882,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      });
      notifySuccess('Store registered successfully!');
      setStores(prev => [created, ...prev]);
      setRestaurantId(created.id);
      setShowStoreModal(false);
      setNewStoreName('');
      setNewStoreAddress('');
    } catch (err) {
      console.error('Store creation error:', err);
      notifyError(err.message || 'Failed to create store.');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Strict Validations
    if (!restaurantId) {
      setFormError('Please select or register a store location.');
      return;
    }
    if (!title.trim()) {
      setFormError('Bundle title is required.');
      return;
    }

    const orig = parseFloat(originalPrice);
    const disc = parseFloat(discountedPrice);
    const qty = parseInt(availableQuantity, 10);
    const weight = parseFloat(weightKg);

    if (isNaN(orig) || orig < 0) {
      setFormError('Original price must be a non-negative number.');
      return;
    }
    if (isNaN(disc) || disc < 0) {
      setFormError('Discounted price must be a non-negative number.');
      return;
    }
    if (disc > orig) {
      setFormError('Discounted price cannot exceed the original price.');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      setFormError('Available quantity must be non-negative.');
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      setFormError('Food weight per bundle must be greater than 0 kg.');
      return;
    }
    if (!pickupDeadline) {
      setFormError('Please select a pickup deadline.');
      return;
    }

    const deadlineDate = new Date(pickupDeadline);
    if (deadlineDate <= new Date()) {
      setFormError('Pickup deadline must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        restaurant_id: restaurantId,
        merchant_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        original_price: orig,
        discounted_price: disc,
        available_quantity: qty,
        weight_kg: weight,
        pickup_deadline: deadlineDate.toISOString(),
        image_url: imageUrl || PHOTO_PRESETS[0].url,
        is_active: true,
      };

      if (isEditing) {
        await bundleService.updateBundle(id, payload);
        notifySuccess('Food bundle updated successfully!');
      } else {
        await bundleService.createBundle(payload);
        notifySuccess('Food bundle published to marketplace!');
      }
      navigate('/merchant/listings');
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Failed to save food bundle.');
      notifyError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading bundle editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/merchant/listings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-forest-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-cream-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-forest-700" /> Back to Listings
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-10 shadow-card space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Edit Food Bundle Listing' : 'Publish Surplus Food Bundle'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Specify the surplus package details, discounted rate, weight, and pickup deadline. Published listings appear live in the customer marketplace immediately.
          </p>
        </div>

        {formError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Store Location Selection */}
          <div className="bg-cream-50/70 p-4 rounded-2xl border border-cream-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Fulfilling Store Location *
              </label>
              <button
                type="button"
                onClick={() => setShowStoreModal(!showStoreModal)}
                className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add New Store Location
              </button>
            </div>

            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
              required
            >
              {stores.length === 0 && (
                <option value="">No stores registered - please add one</option>
              )}
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.address})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Create Store Modal / Accordion */}
          {showStoreModal && (
            <div className="bg-white border-2 border-forest-300 rounded-2xl p-5 shadow-md space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                Register New Store Location in Nagpur
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Store / Outlet Name</label>
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="e.g. Nagpur Fresh Produce Hub"
                    className="w-full p-2 text-xs rounded-lg border border-cream-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Store Category</label>
                  <select
                    value={newStoreCategory}
                    onChange={(e) => setNewStoreCategory(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-cream-300"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Street Address</label>
                  <input
                    type="text"
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    placeholder="e.g. Wardha Road, Near Metro Station, Nagpur"
                    className="w-full p-2 text-xs rounded-lg border border-cream-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newStoreLat}
                    onChange={(e) => setNewStoreLat(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newStoreLng}
                    onChange={(e) => setNewStoreLng(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-cream-300 font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowStoreModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateStore}
                  disabled={creatingStore}
                  className="px-4 py-1.5 rounded-lg bg-forest-800 text-white text-xs font-bold hover:bg-forest-900"
                >
                  {creatingStore ? 'Saving...' : 'Save Store'}
                </button>
              </div>
            </div>
          )}

          {/* Bundle Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Bundle Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Artisan Sourdough & Croissant Bag"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Food Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Bundle Description &amp; Items Included
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what items are included in this surprise surplus package (e.g. 1 whole wheat sourdough loaf and 3 butter croissants baked fresh this morning)."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Original Retail Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Discounted Surplus Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                placeholder="e.g. 180"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white font-bold text-forest-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must be less than or equal to original price
              </span>
            </div>
          </div>

          {/* Quantity, Weight, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Available Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Weight Per Bundle (kg) *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="1.2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Used to calculate avoided CO2e
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Pickup Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Photo URL & Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Food Photography Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/30 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white"
            />

            {/* Photography quick presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">Presets:</span>
              {PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    imageUrl === preset.url
                      ? 'bg-forest-800 text-white border-forest-800 font-bold'
                      : 'bg-white text-slate-600 border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-3">
            <Link
              to="/merchant/listings"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-cream-100 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Listing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {isEditing ? 'Update Listing' : 'Publish Listing'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
