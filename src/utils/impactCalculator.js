/**
 * Environmental Impact Calculator
 * 
 * Sources & Documentation:
 * - Emissions factor source: UN Food and Agriculture Organization (FAO) Food Wastage Footprint (2013/2019 updates) &
 *   Our World in Data / Poore & Nemecek (2018) meta-analysis.
 * - Standard benchmark: ~2.5 kg CO2-equivalent greenhouse gas emissions generated per 1 kg of mixed consumer food waste.
 * - Water footprint benchmark: ~750 Liters of water preserved per 1 kg of rescued food.
 * - Car travel equivalence: 1 kg CO2e is approximately equal to 4.2 km driven in an average petrol passenger car (EPA benchmark).
 */

export const IMPACT_CONFIG = {
  // Configurable emission factor in kg CO2e per kg of food
  EMISSION_FACTOR_KG_CO2E_PER_KG_FOOD: 2.5,
  WATER_FACTOR_LITERS_PER_KG_FOOD: 750,
  CAR_KM_PER_KG_CO2E: 4.2,
  SOURCE_NAME: 'FAO Food Wastage Footprint & Poore & Nemecek (2018)',
  VERSION: '1.2.0-demo-estimate',
  IS_CONFIGURED: true,
  ASSUMPTION_NOTE: 'Estimated using standard mixed urban surplus food profile (produce, dairy, bakery, and prepared meals). Demo estimates should be validated with regional lifecycle assessments.'
};

/**
 * Calculates environmental impact metrics from total rescued food weight in kilograms.
 * Only applies to verified collected/picked-up reservations.
 * 
 * @param {number} totalRescuedKg - Total weight of food rescued in kilograms
 * @param {number} [customFactor] - Optional custom emissions factor override
 * @returns {object} Environmental metrics object
 */
export function calculateImpactMetrics(totalRescuedKg = 0, customFactor = null) {
  const kg = Math.max(0, Number(totalRescuedKg) || 0);
  const factor = customFactor !== null && !isNaN(customFactor) 
    ? Number(customFactor) 
    : IMPACT_CONFIG.EMISSION_FACTOR_KG_CO2E_PER_KG_FOOD;

  const co2AvoidedKg = Number((kg * factor).toFixed(2));
  const waterSavedLiters = Math.round(kg * IMPACT_CONFIG.WATER_FACTOR_LITERS_PER_KG_FOOD);
  const carKmEquivalent = Number((co2AvoidedKg * IMPACT_CONFIG.CAR_KM_PER_KG_CO2E).toFixed(1));

  return {
    foodRescuedKg: Number(kg.toFixed(2)),
    co2AvoidedKg,
    waterSavedLiters,
    carKmEquivalent,
    factorUsed: factor,
    factorSource: IMPACT_CONFIG.SOURCE_NAME,
    version: IMPACT_CONFIG.VERSION,
    assumptionNote: IMPACT_CONFIG.ASSUMPTION_NOTE
  };
}
