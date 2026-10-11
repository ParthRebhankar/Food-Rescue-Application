import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createStoreMapIcon } from '../../utils/leafletConfig';
import { formatCurrency } from '../../utils/formatters';
import { MapPin, Phone, ShoppingBag, Store, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Center Nagpur, Maharashtra
const DEFAULT_CENTER = [21.1458, 79.0882];
const DEFAULT_ZOOM = 13;

export default function StoreMapView({ bundles = [], onSelectStore }) {
  // Group bundles by store
  const storesWithBundles = useMemo(() => {
    const map = new Map();

    bundles.forEach((bundle) => {
      if (!bundle.restaurant) return;
      const r = bundle.restaurant;
      if (!r.latitude || !r.longitude) return;

      const key = r.id;
      if (!map.has(key)) {
        map.set(key, {
          restaurant: r,
          bundles: [],
        });
      }
      map.get(key).bundles.push(bundle);
    });

    return Array.from(map.values());
  }, [bundles]);

  if (storesWithBundles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center shadow-card">
        <div className="w-16 h-16 mx-auto rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Store Coordinates Available</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Currently active surplus bundles do not have geographic coordinates registered. Browse via list view or switch back to grid mode.
        </p>
      </div>
    );
  }

  // Calculate center from first store or fallback
  const firstStore = storesWithBundles[0]?.restaurant;
  const center = firstStore
    ? [firstStore.latitude, firstStore.longitude]
    : DEFAULT_CENTER;

  return (
    <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-card relative">
      <div className="p-4 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-forest-700" />
          <span className="text-xs font-bold text-slate-800">
            Interactive Store Map (Nagpur Area)
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {storesWithBundles.length} active {storesWithBundles.length === 1 ? 'store' : 'stores'} with surplus
        </span>
      </div>

      <div className="h-[520px] w-full relative z-0">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {storesWithBundles.map(({ restaurant, bundles: storeBundles }) => {
            const icon = createStoreMapIcon(restaurant.category);

            return (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="p-3 max-w-xs space-y-2">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {restaurant.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-100 text-forest-800">
                          {restaurant.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {restaurant.address}
                      </p>
                      {restaurant.phone && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-forest-600" />
                          {restaurant.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-forest-700" />
                        Available Bundles ({storeBundles.length}):
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {storeBundles.map((b) => (
                          <div
                            key={b.id}
                            className="bg-cream-50 p-2 rounded-lg border border-cream-200 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 truncate block">
                                {b.title}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {b.available_quantity} left • {b.weight_kg}kg
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-forest-800 block">
                                {formatCurrency(b.discounted_price)}
                              </span>
                              <Link
                                to={`/bundle/${b.id}`}
                                className="text-[10px] font-bold text-forest-600 hover:underline flex items-center gap-0.5"
                              >
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
