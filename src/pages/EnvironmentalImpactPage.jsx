import React, { useEffect, useState } from 'react';
import { impactService } from '../services/impactService';
import { useAuth } from '../context/AuthContext';
import { IMPACT_CONFIG, calculateImpactMetrics } from '../utils/impactCalculator';
import StatsCard from '../components/merchant/StatsCard';
import { 
  BarChart3, 
  Scale, 
  Wind, 
  Droplet, 
  Car, 
  CheckCircle2, 
  Info, 
  Loader2
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export default function EnvironmentalImpactPage() {
  const { user, role } = useAuth();
  
  const [scope, setScope] = useState('global'); // 'global' or 'personal'
  const [customFactor, setCustomFactor] = useState(IMPACT_CONFIG.EMISSION_FACTOR_KG_CO2E_PER_KG_FOOD);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadImpact = async () => {
    setLoading(true);
    try {
      if (scope === 'personal' && user) {
        if (role === 'merchant') {
          const data = await impactService.getMerchantImpact(user.id);
          setImpactData(data);
        } else {
          const data = await impactService.getCustomerImpact(user.id);
          setImpactData(data);
        }
      } else {
        const data = await impactService.getGlobalImpact();
        setImpactData(data);
      }
    } catch (err) {
      console.error('Error loading impact:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImpact();
  }, [scope, user?.id]);

  const metrics = impactData
    ? calculateImpactMetrics(impactData.metrics?.foodRescuedKg || 0, customFactor)
    : calculateImpactMetrics(0, customFactor);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-forest-700" />
            <span>Greenhouse Gas &amp; Waste Accounting</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Environmental Impact Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Quantifying verified edible food diversion from municipal landfills into meals, preventing methane generation.
          </p>
        </div>

        {/* Scope Selector if Logged In */}
        {user && (
          <div className="flex items-center gap-2 bg-cream-100 p-1.5 rounded-2xl border border-cream-200 self-start md:self-auto">
            <button
              onClick={() => setScope('global')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scope === 'global'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Community
            </button>
            <button
              onClick={() => setScope('personal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                scope === 'personal'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-slate-600 hover:text-forest-900'
              }`}
            >
              {role === 'merchant' ? 'My Store Rescues' : 'My Personal Impact'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-forest-700 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Calculating lifecycle carbon metrics...</p>
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Rescued Food"
              value={`${metrics.foodRescuedKg} kg`}
              subtitle="Verified collected surplus food"
              icon={Scale}
              color="forest"
            />

            <StatsCard
              title="Emissions Avoided"
              value={`${metrics.co2AvoidedKg} kg`}
              subtitle={`CO2-equivalent greenhouse gas avoided`}
              icon={Wind}
              color="emerald"
            />

            <StatsCard
              title="Water Preserved"
              value={`${metrics.waterSavedLiters.toLocaleString()} L`}
              subtitle="Embodied agricultural water footprint"
              icon={Droplet}
              color="blue"
            />

            <StatsCard
              title="Car Travel Offset"
              value={`${metrics.carKmEquivalent} km`}
              subtitle="Equivalent passenger car distance"
              icon={Car}
              color="amber"
            />
          </div>

          {/* Scientific Methodology & Configurable Factor Section */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
                  <Info className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Documented Carbon Accounting Methodology
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent formula &amp; empirical benchmarks
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full">
                Demo Estimate Factor: v{IMPACT_CONFIG.VERSION}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-3">
                <p>
                  <strong>Formula:</strong>{' '}
                  <code className="bg-cream-100 px-2 py-1 rounded text-forest-900 font-mono text-xs font-bold block mt-1">
                    avoided emissions (kg CO2e) = food weight (kg) × {customFactor} kg CO2e/kg
                  </code>
                </p>
                <p>
                  <strong>Data Source:</strong> {IMPACT_CONFIG.SOURCE_NAME}. When organic matter decomposes anaerobically in municipal landfills, it produces methane (CH4), a greenhouse gas with 28x the global warming potential of carbon dioxide over a 100-year horizon.
                </p>
                <p>
                  <strong>Critical Integrity Rule:</strong> Emissions and weights are accrued <em>only</em> after a merchant physically confirms in-person pickup. Uncollected or cancelled reservations never inflate metrics.
                </p>
              </div>

              <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">
                  Interactive Factor Tuning (Sensitivity Simulator)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Adapt the conversion factor based on regional lifecycle analyses or specific food stream composites:
                </p>
                
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span>Emissions Factor Override:</span>
                    <span className="font-mono text-forest-900 font-bold">{customFactor} kg CO2e / kg</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={customFactor}
                    onChange={(e) => setCustomFactor(parseFloat(e.target.value))}
                    className="w-full accent-forest-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1.0 (Bakery/Grain)</span>
                    <span>2.5 (Standard Urban Mix)</span>
                    <span>5.0 (High Dairy/Meat)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Collection Logs */}
          <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {scope === 'personal' ? 'Your Verified Collection History' : 'Recent Community Rescues'}
                </h3>
                <p className="text-xs text-slate-500">
                  Transactions with confirmed merchant collection timestamps
                </p>
              </div>
              <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
                {impactData?.totalBundlesCollected || 0} Bundles Logged
              </span>
            </div>

            {(impactData?.recentRescues?.length > 0 || impactData?.history?.length > 0) ? (
              <div className="divide-y divide-cream-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2">Timestamp</th>
                      <th className="py-3 px-2">Item Rescued</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Weight Diverted</th>
                      <th className="py-3 px-2">Avoided CO2e</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100 text-slate-700">
                    {(impactData?.recentRescues || impactData?.history || []).map((item) => {
                      const weight = (item.bundle?.weight_kg || 1) * (item.quantity || 1);
                      const co2 = (weight * customFactor).toFixed(2);
                      return (
                        <tr key={item.id} className="hover:bg-cream-50/50">
                          <td className="py-3 px-2 text-slate-500">
                            {formatDateTime(item.picked_up_at || item.created_at)}
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-900">
                            {item.bundle?.title || 'Surplus Bundle'}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cream-100 text-slate-700">
                              {item.bundle?.category || 'Food'}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            {weight.toFixed(1)} kg ({item.quantity}x)
                          </td>
                          <td className="py-3 px-2 font-bold text-emerald-700">
                            +{co2} kg CO2e
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Picked Up
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No collected pickups recorded yet. As customers collect reserved bundles and merchants confirm pickups, transparent impact entries will populate here automatically.
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
